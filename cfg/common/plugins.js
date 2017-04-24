'use strict';

let webpack = require('webpack');

module.exports = {
  devPlugins: [
    new webpack.optimize.AggressiveMergingPlugin()
  ],

  prodPlugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      include: /\.js$/
    }),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ]
};
