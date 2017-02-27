'use strict';

let distConfig = require('./dist');

let config = Object.assign({}, distConfig, {
  plugins: require('./common/plugins').minPlugins,
});

config.output.filename = '[name].[hash].min.js';
config.output.chunkFilename = '[id].[hash].min.js';

module.exports = config;
