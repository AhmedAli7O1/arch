'use strict';

const path = require('path');
const _ = require('lodash');

module.exports = function (name, data) {
  const mod = require(path.resolve(__dirname, 'structureExamples', name));
  return JSON.parse(_.template(JSON.stringify(mod))(data));
};