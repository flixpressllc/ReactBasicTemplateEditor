/*eslint no-console:0 */
'use strict';
require('core-js/fn/object/assign');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('./webpack.config');
const open = require('open');
const args = require('minimist')(process.argv.slice(2));
const host = '0.0.0.0';

new WebpackDevServer(webpack(config), config.devServer)
.listen(config.port, host, (err) => {
  if (err) {
    console.log(err);
  }
  var href = 'http://' + host + ':' + config.port + '/webpack-dev-server/';
  console.log('Listening at ' + host + ':' + config.port);
  if (args.openWith === undefined) {
    console.log('Opening your system browser...');
    open(href);
  } else {
    console.log('Opening with ' + args.openWith);
    open(href, args.openWith);
  }
});
