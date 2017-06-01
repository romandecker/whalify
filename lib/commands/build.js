'use strict';

const Promise = require('bluebird');
const os = require('os');
const path = require('path');
const fs = require('fs-extra-promise');
const build = require('../build.js');

module.exports = {
  command: 'build [path]',
  description: 'Build the given directory using docker',
  builder: function(yargs) {
    return yargs
      .option('name', {
        alias: 'n',
        description: 'Name of the docker image to build'
      })
      .option('auth-token', {
        alias: 't',
        description: 'Use a custom npm-auth-token to install the package within the docker image'
      });
  },
  handler: function(argv) {
    argv.path = argv.path || process.cwd();

    return Promise.join(getAuthToken(argv), getImageName(argv)).spread(function(
      authToken,
      imageName
    ) {
      return build(argv.path, imageName, { authToken });
    });
  }
};

function getAuthToken(argv) {
  if (argv.authToken) {
    return argv.authToken;
  }

  return fs
    .readFileAsync(path.join(os.homedir(), '.npmrc'), 'utf8')
    .then(function(npmrc) {
      const match = npmrc.match(/registry.npmjs.org\/:_authToken=(.*)/);
      if (!match) {
        return null;
      }

      return match[1];
    })
    .catch(e => e.code === 'ENOENT', () => null);
}

function getImageName(argv) {
  if (argv.name) {
    return argv.name;
  } else {
    return fs.readJsonAsync(path.join(argv.path, 'package.json')).then(function(packageJson) {
      const name = packageJson.name.replace(/^@.+?\//, '');
      return `${name}:${packageJson.version}`;
    });
  }
}
