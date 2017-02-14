const gulp = require('gulp');
const s3 = require('gulp-s3');

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
