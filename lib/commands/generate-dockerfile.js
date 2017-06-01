'use strict';

const compileDockerfile = require('../compile-dockerfile.js');
const fs = require('fs-extra-promise');
const path = require('path');

module.exports = {
  command: 'generate-dockerfile [dest-dir]',
  description: 'Generate a basic Dockerfile to start from',
  builder: function(yargs) {
    return yargs
      .option('base', {
        alias: 'b',
        description: 'The base docker-image to use',
        default: 'node:8.0.0'
      })
      .option('dest-dir');
  },
  handler: function(argv) {
    const dockerfile = compileDockerfile(argv);

    if (argv.destDir) {
      return fs.writeFileAsync(path.join(argv.destDir, 'Dockerfile'), dockerfile, 'utf8');
    } else {
      console.log(dockerfile);
    }
  }
};
