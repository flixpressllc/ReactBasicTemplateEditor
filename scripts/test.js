process.env.NODE_ENV = 'test';
process.env.PUBLIC_URL = '';

// Load environment variables from .env file. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.
// https://github.com/motdotla/dotenv
require('dotenv').config({silent: true});

const jest = require('jest');
const argv = process.argv.slice(2);

// Watch unless on CI
function isOnCI() {
  return process.env.CI;
}

function askedForNoWatch() {
  return argv.indexOf('--noWatch') > -1
}

function shouldNotWatch() {
  return isOnCI() || askedForNoWatch();
}

function removeMyAddedNoWatch() {
  let index = argv.indexOf('--noWatch');
  if (index > -1) {
    argv.splice(index, 1);
  }
}

if (! shouldNotWatch() ) {
  argv.push('--watch');
}

removeMyAddedNoWatch();

jest.run(argv);
