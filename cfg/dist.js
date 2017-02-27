'use strict';

let buildConfig = require('./common/build');

let config = Object.assign({}, buildConfig, {
  plugins: require('./common/plugins').distPlugins,
});

config.output.filename = '[name].[hash].js';
config.output.chunkFilename = '[id].[hash].js';

module.exports = config;
