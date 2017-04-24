'use strict';

let path = require('path');
let baseConfig = require('./base');
let defaultSettings = require('./defaults');
let pathFinder = require('./pathFinder');

let config = Object.assign({}, baseConfig, {
  entry: {
    templateEditor: path.join(__dirname, '../../src/index')
  },
  cache: false,
  devtool: 'sourcemap',
  module: defaultSettings.getDefaultModules()
});

// Add needed loaders to the defaults here
config.module.rules.push({
  test: /\.(js|jsx)$/,
  loader: 'babel',
  include: [].concat(
    config.additionalPaths,
    [ path.join(__dirname, '/../../src') ]
  )
});

config.output.path = pathFinder(config.output.path, process.cwd());
console.log('Building into ' + config.output.path);

module.exports = config;
