'use strict';

const fs = require('../utils/fs');
const dw = require('download');
const path = require('path');
const request = require('request-promise');
const log = require('../utils/log');

let _baseURL;

function download (pkgName, version, saveLocation) {

  return request.get(_baseURL + pkgName + '/master/' + version + '.js')
    .then(data => {
      return fs.outputFile(path.resolve(saveLocation, pkgName + '.js'), data)
    })
    .catch(err => {
      err.message += `while trying to download the pkg ${pkgName} ` + err.message;
      throw err;
    });

}

module.exports = function (baseURL) {

  _baseURL = baseURL;

  return {
    download,
    _test: {
      request
    }
  };

};
