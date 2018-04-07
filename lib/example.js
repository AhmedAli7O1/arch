'use strict';

const log = require('../utils/log');
const config = require('../config.json');
const request = require('request-promise');
const decompress = require('decompress');
const downloader = require('./downloader');
const _ = require('lodash');
const path = require('path');
const npmHandler = require('./npm');

const pkgsTreeURL = config.examplesManager.pkgsTreeURL;
const pkgDownloadURL = config.examplesManager.pkgDownloadURL;

function examplesInfo() {
  const options = {
    url: pkgsTreeURL,
    method: 'GET',
    json: true
  };
  return request.get(options);
}

async function download({ pkgName, location, version }) {
  const downloadLink = _.template(pkgDownloadURL)({ pkgName, version });
  const data = await downloader(downloadLink);
  return decompress(data, location, { strip: 1 });
}

async function installDeps (location) {
  return npmHandler.install(location);  
}

module.exports = {
  examplesInfo,
  download,
  installDeps
};
