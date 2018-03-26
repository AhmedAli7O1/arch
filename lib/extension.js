'use strict';

/**
 * extensions loader
 * @module lib/extension
 */

const fs = require('../utils/fs');
const _ = require('lodash');
const log = require('../utils/log');

const exts = {
  before: [],
  component: [],
  after: []
};

async function loadExtensions(extensionsPath, userExtensions = []) {
  
  if (!await fs.canRead(extensionsPath)) {
    return [];
  }

  const extensionsNames = _.get(await fs.dirContent(extensionsPath), 'files');

  const extensionsLocations = fs.resolvePaths(extensionsNames, extensionsPath);
  let loadedExtensions = fs.loadModules(extensionsLocations, true);

  userExtensions = _.map(userExtensions, x => {
    const data = _.get(_.find(loadedExtensions, { name: x }), 'data');
    if (data) {
      return {
        name: x.name,
        data
      };
    }
    else {
      throw new Error(`extension ${x} is defined in the nodearch user config but not found on disk`);
    }

  });

  _.forEach(userExtensions, extension => {
    _.forEach(_.keys(exts), event => {
    const eventFunc = extension.data[event];
      if (eventFunc) {
        exts[event].push(eventFunc);
      }
    });
  });

  return exts;

}

async function exec (event, ...args) {
  for(const ev of exts[event]) {
    await ev(...args);
  }
}

module.exports = { loadExtensions, exec };
