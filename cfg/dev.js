'use strict';

let path = require('path');
let webpack = require('webpack');
let baseConfig = require('./common/base');
let defaultSettings = require('./common/defaults');

// Add needed plugins here

let config = Object.assign({}, baseConfig, {
  entry: [
    'webpack-dev-server/client?http://127.0.0.1:' + 8000,
    'webpack/hot/only-dev-server',
    './src/index'
  ],
  cache: true,
  devtool: 'eval-source-map',
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  module: defaultSettings.getDefaultModules()
});

// Add needed loaders to the defaults here
config.module.rules.push({
  test: /\.(js|jsx)$/,
  loader: 'babel-loader',
  include: path.join(__dirname, '/../src')
});

module.exports = config;
