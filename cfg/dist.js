'use strict';

let buildConfig = require('./common/build');

let config = Object.assign({}, buildConfig, {
  plugins: require('./common/plugins').distPlugins,
});

module.exports = config;
