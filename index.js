'use strict';

module.exports = {
  build: require('./lib/build.js'),
  generateInstaller: require('./lib/generate-installer.js'),
  generateDockerfile: require('./lib/generate-dockerfile.js')
};
