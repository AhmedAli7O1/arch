'use strict';

const _ = require('lodash');

module.exports = function (pathsConfig) {

  return function (strPath, data) {
    const foundPath = _.get(pathsConfig, strPath);
    return _.template(foundPath)(data);
  }

};