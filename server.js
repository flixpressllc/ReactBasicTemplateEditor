/*eslint no-console:0 */
'use strict';
require('core-js/fn/object/assign');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('./webpack.config');
const open = require('open');
const args = require('minimist')(process.argv.slice(2));

new WebpackDevServer(webpack(config), config.devServer)
.listen(config.port, 'localhost', (err) => {
  if (err) {
    console.log(err);
  }
  var href = 'http://localhost:' + config.port + '/webpack-dev-server/';
  console.log('Listening at localhost:' + config.port);
  if (args.openWith === undefined) {
    console.log('Opening your system browser...');
    open(href);
  } else {
    console.log('Opening with ' + args.openWith);
    open(href, args.openWith);
  }
});
