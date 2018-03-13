'use strict';

/**
 * extensions loader
 * @module lib/extension
 */

const fs = require('../utils/fs');
const _ = require('lodash');

const exts = {
  before: [],
  component: [],
  after: []
};

async function loadExtensions(extensionsPath, extensionsNames = []) {
  
  if (_.isEmpty(extensionsNames)) {
    return;
  }

  const extensionsLocations = fs.resolvePaths(extensionsNames, extensionsPath);

  const extensions = _.map(fs.loadModules(extensionsLocations, true), 'data');

  _.forEach(extensions, extension => {
    _.forEach(_.keys(exts), event => {
      const eventFunc = extension[event];
      if (eventFunc) {
        exts[event].push(eventFunc);
      }
    });
  });

  return exts;

}

async function exec (event, args) {
  for(const ev of exts[event]) {
    await ev(args);
  }
}

module.exports = { loadExtensions, exec };
