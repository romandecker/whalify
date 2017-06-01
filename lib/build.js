'use strict';

const _ = require('lodash');
const spawn = require('child_process').spawn;

module.exports = function build(path, imageName, options) {
  options = _.defaults({}, options);
  const args = ['build', '-t', imageName];

  if (options.authToken) {
    args.push('--build-arg', `NPM_AUTH_TOKEN=${options.authToken}`);
  }

  args.push(path);

  return new Promise(function(resolve, reject) {
    const docker = spawn('docker', args, { stdio: options.silent ? 'ignore' : 'inherit' });

    docker.on('exit', function(code) {
      if (code === 0) {
        resolve();
      } else {
        reject(code);
      }
    });
    docker.on('error', reject);
  }).then(function() {
    console.log('docker exited');
  });
};
