'use strict';

let distConfig = require('./dist');

let config = Object.assign({}, distConfig, {
  plugins: require('./plugins').minPlugins,
});

config.output.filename = '[name].min.js';
config.output.chunkFilename = '[id].min.js';

module.exports = config;
