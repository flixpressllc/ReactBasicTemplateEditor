'use strict';

let path = require('path');
let webpack = require('webpack');

let baseConfig = require('./base');
let defaultSettings = require('./defaults');

// Add needed plugins here
let BowerWebpackPlugin = require('bower-webpack-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin');

const args = require('minimist')(process.argv.slice(2));
const fs = require('fs');

var outputPath = defaultSettings.devOutputPath;
if (args.location !== undefined) {
  outputPath = path.isAbsolute(args.location) ? args.location : path.join(__dirname, '../', args.location);
}

// Let's make sure the user input is good...
try {
  if (fs.statSync(outputPath).isDirectory() === false) {
    throw new Error(outputPath + ' is not a directory.');
    process.exit();
  }
} catch (e) {
  var errorMessage = 'Output Path is invalid: ';
  if (args.location) {
    errorMessage += 'The path you provided ( "' + args.location + '" ) does not resolve to an actual directory.';
    if (path.isAbsolute(args.location) === false) {
      errorMessage += ' The relative path you passed in is trying to resolve to "' + outputPath + '". If you meant to supply an absolute path, start from the root of your hard drive. Something like "C:\\\\path\\to\\folder" on Windows, or "/path/to/folder" on everything else.';
    }
  } else {
    errorMessage += 'You must provide a path to a folder for file compilation. It can be an absolute path from the root directory of your hard drive, or it can be relative to the root directory of this project.';
  }
  throw new Error(errorMessage);
  process.exit();
}

console.log('Building into ' + outputPath);

let config = Object.assign({}, baseConfig, {
  entry: path.join(__dirname, '../src/index'),
  cache: false,
  devtool: 'sourcemap',
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new BowerWebpackPlugin({
      searchResolveModulesDirectories: false
    }),
    new ExtractTextPlugin('editor.css', {allChunks: true}),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  output: {
    path: outputPath,
    filename: 'templateEditor.js',
    publicPath: '.'
  },
  module: defaultSettings.getDefaultModules()
});

// Add needed loaders to the defaults here
config.module.loaders.push({
  test: /\.(js|jsx)$/,
  loader: 'babel',
  include: [].concat(
    config.additionalPaths,
    [ path.join(__dirname, '/../src') ]
  )
});

module.exports = config;
