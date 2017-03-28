const gulp = require('gulp');
const s3 = require('gulp-s3');
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

gulp.task('checkRepoIsClean', () => {
  git.exec({args : 'diff-index HEAD --'}, function (err, stdout) {
    if (err) throw err;
    if (stdout.match(/[\S]/)) { // anything not whitespace
      throw new Error('Uncommited changes in repo');
    }
  });
})

let increment, currentVersion, releaseVersion, continuingVersion, gitTagName;

gulp.task('release', () => {
  increment = argv.increment || 'patch';
  currentVersion = getPackageJson().version;
  releaseVersion = semver.inc(currentVersion, increment);
  continuingVersion = semver.inc(releaseVersion, 'patch') + '-pre';
  gitTagName = 'FAKEv' + releaseVersion

  git.pull((err) => {
    if (err) throw err;
  });

  rs('bumpToRelease', 'commitAllForRelease', 'tagCurrentRelease', 'undoCommit', 'bumpToContinuingVersion', 'commitPkgForContinuing', 'pushMasterAndNewTag')
});

gulp.task('bumpToRelease', () => {
  return gulp.src('./package.json')
  .pipe(bump({version: releaseVersion}))
  .pipe(gulp.dest('./'));
});

gulp.task('commitAllForRelease', () => {
  return gulp.src(['./dist/*', './package.json'])
    .pipe(git.add())
    .pipe(git.commit('Release Version ' + gitTagName))
})

gulp.task('tagCurrentRelease', (cb) => {
  git.tag(gitTagName, '', (err) => {
    if (err) throw err;
    cb();
  });
});

gulp.task('undoCommit', (cb) => {
  git.reset('HEAD~1', {args:'--hard'}, function (err) {
    if (err) throw err;
    cb();
  });
})

gulp.task('bumpToContinuingVersion', () => {
  return gulp.src('./package.json')
  .pipe(bump({version: continuingVersion}))
  .pipe(gulp.dest('./'));
});

gulp.task('commitPkgForContinuing', () => {
  return gulp.src('./package.json')
    .pipe(git.add())
    .pipe(git.commit('bump to ' + continuingVersion))
})

gulp.task('pushMasterAndNewTag', (cb) => {
  let currentBranch = '';
  git.exec({args : 'rev-parse --abbrev-ref HEAD'}, function (err, stdout) {
    if (err) throw err;
    currentBranch = stdout.trim();
    git.push('origin', currentBranch, (err) => {
      if (err) throw err;
      git.push('origin', gitTagName, (err) => {
        if (err) throw err;
        cb();
      })
    });
  });
});

