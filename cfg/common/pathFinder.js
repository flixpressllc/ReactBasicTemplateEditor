'use strict';

let path = require('path');
const args = require('minimist')(process.argv.slice(2));
const fs = require('fs');

var pathFinder = function (inputPath, rootDir) {
  var outputPath = inputPath;
  if (args.location !== undefined) {
    outputPath = path.isAbsolute(args.location) ? args.location : path.join(rootDir, args.location);
    // Let's make sure the user input is good...
    try {
      if (fs.statSync(outputPath).isDirectory() === false) {
        throw new Error(outputPath + ' is not a directory.');
        process.exit();
      }
    } catch (e) {
      var errorMessage = 'Output Path is invalid: ';
      if (args.location) {
        errorMessage += 'The path you provided ( "' + args.location + '" ) does not resolve to an actual directory.';
        if (path.isAbsolute(args.location) === false) {
          errorMessage += ' The relative path you passed in is trying to resolve to "' + outputPath + '". If you meant to supply an absolute path, start from the root of your hard drive. Something like "C:\\\\path\\to\\folder" on Windows, or "/path/to/folder" on everything else.';
        }
      } else {
        errorMessage += 'You must provide a path to a folder for file compilation. It can be an absolute path from the root directory of your hard drive, or it can be relative to the root directory of this project.';
      }
      throw new Error(errorMessage);
      process.exit();
    }
  }
  return outputPath;
}

module.exports = pathFinder;