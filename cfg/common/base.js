'use strict';
let path = require('path');
let defaultSettings = require('./defaults');

module.exports = {
  devtool: 'eval',
  output: {
    path: path.join(__dirname, '/../../build'),
    filename: '[name].js',
    chunkFilename: '[id].js',
    publicPath: `.${defaultSettings.publicPath}`
  },
  devServer: {
    contentBase: ['./src/', './node_modules/'],
    historyApiFallback: true,
    hot: true,
    port: defaultSettings.port,
    publicPath: defaultSettings.publicPath,
    noInfo: false,
    proxy: [
      {
        context: ['/templates/images/*'],
        target: 'https://flixpress.com',
        changeOrigin: true
      },
      {
        context: ['/Scripts/flixpress-js/*'],
        target: 'https://s3.amazonaws.com/FlixSamples/development_files',
        changeOrigin: true
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      actions: `${defaultSettings.srcPath}/actions/`,
      components: `${defaultSettings.srcPath}/components/`,
      sources: `${defaultSettings.srcPath}/sources/`,
      stores: `${defaultSettings.srcPath}/stores/`,
      styles: `${defaultSettings.srcPath}/styles/`,
      utils: `${defaultSettings.srcPath}/utils/`,
      config: `${defaultSettings.srcPath}/config/` + process.env.REACT_WEBPACK_ENV
    }
  },
  module: {}
};
