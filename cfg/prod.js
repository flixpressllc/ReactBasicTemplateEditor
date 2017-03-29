'use strict';

let buildConfig = require('./common/build');

let config = Object.assign({}, buildConfig, {
  plugins: require('./common/plugins').prodPlugins,
});

config.output.filename = '[name].js';
config.output.chunkFilename = '[id].js';

module.exports = config;
