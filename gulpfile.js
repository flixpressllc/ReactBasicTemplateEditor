const gulp = require('gulp');
const s3 = require('gulp-s3');
const rename = require('gulp-rename');
const vp = require('vinyl-paths');
const del = require('del');

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

const MATCH_FIRST_TWO_PARTS = /([^.]*)\.([^.]*)/;

gulp.task('consolidateHashes', () => {
  let hashToApply = '';
  const HASH_CHAR_LIMIT = 5;
  function setHashVia (basename) {
    hashToApply = basename
      .match(MATCH_FIRST_TWO_PARTS)[2]
      .substring(0, HASH_CHAR_LIMIT);
  }
  function replaceHashOn (basename) {
    if (hashToApply === '') setHashVia(basename);
    return basename.replace(MATCH_FIRST_TWO_PARTS, (match, p1, p2) => {
      return [p1, hashToApply].join('.');
    })
  }
  // warning: glob pattern `/**` matches all children and parent. That's why I am using `/*`
  return gulp.src('./dist/*')
    .pipe(vp(del)) // delete everything in dist (files are in memory here)
    .pipe( rename(path => {
      path.basename = replaceHashOn(path.basename);
    }))
    .pipe(gulp.dest('dist')); // add back only renamed versions of files
});

gulp.task('removeHashes', () => {
  // warning: glob pattern `/**` matches all children and parent. That's why I am using `/*`
  return gulp.src('./dist/*')
    .pipe(vp(del)) // delete everything in dist (files are in memory here)
    .pipe( rename(path => {
      path.basename = path.basename.replace(MATCH_FIRST_TWO_PARTS, (match, p1) => p1);
    }))
    .pipe(gulp.dest('dist')); // add back only renamed versions of files
});
