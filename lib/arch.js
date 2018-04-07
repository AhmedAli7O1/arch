'use strict';

/**
 * nodearch user configuration loader
 * @module lib/arch
 */

const fs = require('../utils/fs');
const _ = require('lodash');
const log = require('../utils/log');

module.exports = async function (location, noLog) {
  try {

    const isExist = await fs.canRead(location);

    if (isExist) {
      return _.get(await fs.loadModules(location, true), 'data');
    }
    else if (!noLog) {
      log.warn(
        `
        arch config file not found!
        location: ${location}
        in the meantime we'll continue and use the defaults`
      );
    }

  }
  catch (e) {
    throw new Error(
      `while trying to load the arch config file [nodearch.json] 
      ${e}`
    );
  }
};