'use strict';

const path = require('path');
const generateInstaller = require('../generate-installer.js');

module.exports = {
  command: 'generate-installer [source-dir] [dest-dir]',
  description: 'Generate the whalify-installer',
  builder: function(yargs) {
    return yargs.option('source-dir').option('dest-dir');
  },
  handler: function(argv) {
    const sourceDir = argv.sourceDir || process.cwd();
    const destDir = argv.destDir || path.join(sourceDir, '.whalify');

    return generateInstaller(sourceDir, destDir);
  }
};
