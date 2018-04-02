'use strict';

/**
 * environment setup
 * @module lib/env
 */

const _ = require('lodash');

module.exports = function (processEnv, processArgs = []) {
  const env = _.find(processArgs, (arg) => arg.match(/(env=)\w+/g));

  if (env) {
    return env.replace('env=', '');
  }

  return processEnv || 'development';
};