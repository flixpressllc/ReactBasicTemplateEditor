const gulp = require('gulp');
const s3 = require('gulp-s3');
const rename = require('gulp-rename');
const vp = require('vinyl-paths');
const del = require('del');
const gReplace = require('gulp-replace');
const rs = require('run-sequence');
const bump = require('gulp-bump');
const argv = require('yargs').argv;
const git = require('gulp-git');
const fs = require('fs');
const semver = require('semver');

function getPackageJson () {
  return JSON.parse(fs.readFileSync('./package.json', 'utf8'));
}

// See the .example.env file to learn how to set up your required .env file.
require('dotenv').load();

const awsCredentials = {
  key: process.env.AWS_ACCESS_KEY_ID,
  secret: process.env.AWS_SECRET_ACCESS_KEY,
  bucket: 'FlixSamples'
}

if (!awsCredentials.key || !awsCredentials.secret) {
  console.log( '\n\n\n\nAWS credentials were not present. Did you create a `.env` file that looks like `.env.example` in the root directory of this repo?\n\n');
  process.exit();
}

const awsOptions = {
  uploadPath: 'development_files/Scripts/templateEditor/'
}

gulp.task('aws', () => {
  return gulp.src('dist/**')
    .pipe( s3(awsCredentials, awsOptions) );
});



let increment, currentVersion, releaseVersion, continuingVersion;

gulp.task('release', () => {
  increment = argv.increment || 'patch';
  currentVersion = getPackageJson().version;
  releaseVersion = semver.inc(currentVersion, increment);
  continuingVersion = semver.inc(releaseVersion, 'patch') + '-pre';
  console.log(increment, currentVersion, releaseVersion, continuingVersion);

  git.pull((err) => {
    console.log(err);
    process.exit();
  });

  rs('bumpToRelease', 'commitAllForRelease')
});

gulp.task('bumpToRelease', () => {
  return gulp.src('./package.json')
  .pipe(bump({version: releaseVersion}))
  .pipe(gulp.dest('./'));
});

gulp.task('commitAllForRelease', () => {
  return gulp.src(['./dist/*', './package.json'])
    .pipe(git.add())
    .pipe(git.commit('Release Version v' + releaseVersion))
})