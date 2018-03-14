'use strict';

const fs = require('../utils/fs');
const dw = require('download');
const path = require('path');
const request = require('request-promise');
const log = require('../utils/log');
const _ = require('lodash');

let _baseURL;

function download (pkgName, version, saveLocation) {

  return request.get(_baseURL + pkgName + '/master/' + resolveVersion(version) + '.js')
    .then(data => {
      return fs.outputFile(path.resolve(saveLocation, pkgName + '.js'), data)
    })
    .catch(err => {
      err.message += `while trying to download the pkg ${pkgName} ` + err.message;
      throw err;
    });

}

function resolveVersion (version) {

  const parts = version.split('.') || [];

  switch(parts.length) {
    case 1:
      parts.push('0');
      parts.push('0');
      break;
    case 2:
      parts.push('0');
      break;
    case 3:
      break;
    default:
      throw new Error(`invalid version number ${version}`);
  }

  return _.join(parts, '.');

}

module.exports = function (baseURL) {

  _baseURL = baseURL;

  return {
    download,
    _test: {
      request,
      resolveVersion
    }
  };

};
