'use strict';
const path = require('path');
const srcPath = path.join(__dirname, '/../../src');
function getDefaultModules() {
  return {rules: [
    {
      test: /\.(js|jsx)$/,
      include: srcPath,
      enforce: 'pre',
      loader: 'eslint-loader'
    },
    {
      test: /\.(png|jpg|gif|woff|woff2)$/,
      use: [{loader: 'url-loader', options: {limit: 8192}}]
    },
    {
      test: /\.(mp4|ogg|svg)$/,
      use: ['file-loader']
    },
    {
      test: /reset\.css$/,
      use: [
        'style-loader',
        'css-loader',
        'postcss-loader'
      ]
    },
    {
      test: /^(.(?!eset))*\.css$/, // horribly hacky way to include all css except reset.css
      use: [
        'style-loader',
        'css-loader',
        'postcss-loader'
      ]
    },
    {
      test: /\.sass/,
      use: [
        'style-loader',
        'css-loader',
        'postcss-loader',
        {loader:'sass-loader', options: {outputStyle: 'expanded'}}
      ]
    },
    {
      test: /\.scss/,
      use: [
        'style-loader',
        'css-loader',
        'postcss-loader',
        {loader:'sass-loader', options: {outputStyle: 'expanded'}}
      ]
    }
  ]};
}
module.exports = {
  srcPath: srcPath,
  port: 8000,
  publicPath: '/',
  getDefaultModules: getDefaultModules,
  postcss: function () {
    return [];
  }
};
