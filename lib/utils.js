'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const shell = require('shelljs');

module.exports = {
  execTrim: function(command, options) {
    options = _.defaults({ async: true }, options);
    return Promise.fromCallback(cb => shell.exec(command, options, cb)).then(_.trim);
  }
};
