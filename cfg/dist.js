'use strict';

let buildConfig = require('./build');

let config = Object.assign({}, buildConfig, {
  plugins: require('./plugins').distPlugins,
});

module.exports = config;
