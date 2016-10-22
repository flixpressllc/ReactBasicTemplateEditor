'use strict';
const path = require('path');
const srcPath = path.join(__dirname, '/../../src');
const dfltPort = 8000;
const ExtractTextPlugin = require('extract-text-webpack-plugin');
function getDefaultModules(opt) {
  var loaders = [
    {
      test: /\.(png|jpg|gif|woff|woff2)$/,
      loader: 'url-loader?limit=8192'
    },
    {
      test: /\.(mp4|ogg|svg)$/,
      loader: 'file-loader'
    },
    {
      test: /\.json$/,
      loader: 'json-loader'
    }
  ];
  if (typeof opt === 'object' && opt.hot === true){
    loaders.push(
      {
        test: /reset\.css$/,
        loader: 'style-loader!css-loader!postcss-loader'
      },
      {
        test: /^(.(?!eset))*\.css$/, // horribly hacky way to include all css except reset.css
        loader: 'style-loader!css-loader!postcss-loader'
      },
      {
        test: /\.sass/,
        loader: 'style-loader!css-loader!postcss-loader!sass-loader?outputStyle=expanded'
      },
      {
        test: /\.scss/,
        loader: 'style-loader!css-loader!postcss-loader!sass-loader?outputStyle=expanded'
      }
    )
  } else {
    loaders.push(
      {
        test: /reset\.css$/,
        loader: 'style-loader!css-loader!postcss-loader'
      },
      {
        test: /^(.(?!eset))*\.css$/, // horribly hacky way to include all css except reset.css
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader!postcss-loader')
      },
      {
        test: /\.sass/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader!postcss-loader!sass-loader?outputStyle=expanded')
      },
      {
        test: /\.scss/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader!postcss-loader!sass-loader?outputStyle=expanded')
      }
    )
  }
  
  return {
    preLoaders: [{
        test: /\.(js|jsx)$/,
        include: srcPath,
        loader: 'eslint-loader'
      }],
    loaders: loaders
  };
}
module.exports = {
  srcPath: srcPath,
  publicPath: '/',
  port: dfltPort,
  getDefaultModules: getDefaultModules,
  postcss: function () {
    return [];
  }
};