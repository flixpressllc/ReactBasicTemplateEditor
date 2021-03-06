/*eslint no-console:0 */
'use strict';
require('core-js/fn/object/assign');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
let config = require('./webpack.config');
const open = require('open');
const args = require('minimist')(process.argv.slice(2));
const host = '0.0.0.0';
const port = require('./cfg/common/defaults').port;

// Hot Module replacement is broken at the moment...
// uncomment the following to re-enable and debug
config.devServer.hot = false;

new WebpackDevServer(webpack(config), config.devServer)
.listen(port, host, (err) => {
  if (err) {
    console.log(err);
  }
  var domain = host === '0.0.0.0' ? 'localhost' : host;
  var href = 'http://' + domain + ':' + port + '/webpack-dev-server/';
  console.log('Listening at ' + host + ':' + port);
  if (args.openWith === undefined) {
    console.log('Opening your system browser...');
    open(href);
  } else {
    console.log('Opening with ' + args.openWith);
    open(href, args.openWith);
  }
});
