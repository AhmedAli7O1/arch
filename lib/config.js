'use strict';

const archConfig = require('../config.json');
const _ = require('lodash');

function initArchConfig (data) {
  archConfig.paths = _.mapValues(archConfig.paths, x => _.template(x)(data));
}

module.exports = {
  arch: {}
};