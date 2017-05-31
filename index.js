#!/usr/bin/env node

'use strict';

const Promise = require('bluebird');
const fs = require('fs-extra-promise');
const path = require('path');
const _ = require('lodash');
const DepGraph = require('dependency-graph').DepGraph;
const shell = require('shelljs');

const compileInstaller = require('./lib/compile-installer.js');

module.exports = function whalify(sourceDir, destDir) {
  sourceDir = sourceDir || process.cwd();
  destDir = destDir || path.join(sourceDir, '.whalify');

  return fs.emptyDirAsync(destDir).then(() => buildLinkGraph(sourceDir)).then(function(graph) {
    const packages = graph.overallOrder();
    return Promise.map(packages, function(modulePath) {
      const dependencies = graph.dependenciesOf(modulePath);
      return packModule(destDir, modulePath).then(buildPath => ({
        path: path.basename(buildPath),
        name: getModuleName(modulePath),
        dependencies: dependencies.map(getModuleName)
      }));
    }).then(function(modules) {
      const installerPath = path.join(destDir, 'install.sh');
      return fs.writeFileAsync(installerPath, compileInstaller({ modules }), {}).then(function() {
        return fs.chmodAsync(installerPath, parseInt('744', 8));
      });
    });
  });
};

if (require.main === module) {
  const argv = require('yargs').usage('Usage: $0 [package] [destination]').strict().help().argv;
  module.exports(argv._[0], argv._[1]);
}

function packModule(buildDir, modulePath) {
  return execTrim('npm pack', { cwd: modulePath, silent: true }).then(function(archiveName) {
    const archivePath = path.join(modulePath, archiveName);
    const destPath = path.join(buildDir, archiveName);

    return fs.moveAsync(archivePath, destPath).thenReturn(destPath);
  });
}

function getModuleName(modulePath) {
  return require(path.join(modulePath, 'package.json')).name;
}

function buildLinkGraph(dir, graph = new DepGraph()) {
  graph.addNode(dir);

  return getSymlinkedModules(dir)
    .map(function(l) {
      return resolveDeep(l).then(function(m) {
        return buildLinkGraph(m, graph).tap(function() {
          graph.addDependency(dir, m);
        });
      });
    })
    .thenReturn(graph);
}

function getSymlinkedModules(dir) {
  return fs.statAsync(dir).then(() => getSymlinks(path.join(dir, 'node_modules')));
}

function getSymlinks(modulesPath) {
  return fs
    .readdirAsync(modulesPath)
    .catch(e => e.code === 'ENOENT', () => [])
    .map(function(module) {
      const modulePath = path.join(modulesPath, module);

      // take care to look into vendor prefixes
      if (module[0] === '@') {
        return getSymlinks(modulePath);
      }

      return fs.lstatAsync(modulePath).then(function(stats) {
        if (stats.isSymbolicLink()) {
          return [modulePath];
        } else {
          return [];
        }
      });
    })
    .then(_.flatten);
}

function resolveDeep(symlinkPath) {
  return fs.readlinkAsync(symlinkPath).then(function(linkedPath) {
    const symlinkDirectory = path.dirname(symlinkPath);
    const absoluteTargetPath = path.resolve(symlinkDirectory, linkedPath);

    return fs.lstatAsync(absoluteTargetPath).then(function(targetStats) {
      if (targetStats.isSymbolicLink()) {
        return resolveDeep(absoluteTargetPath);
      }

      return absoluteTargetPath;
    });
  });
}

function execTrim(command, options) {
  options = _.defaults({ async: true }, options);
  return Promise.fromCallback(cb => shell.exec(command, options, cb)).then(_.trim);
}
