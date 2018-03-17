'use strict';

const fs = require('../utils/fs');
const path = require('path');
const request = require('request-promise');
const unzip = require('extract-zip');
const log = require('../utils/log');
const _ = require('lodash');
const downloader = require('./downloader');
const paths = require

let _baseURL;

function extract ({ dir, source }) {
  return new Promise((resolve, reject) => {
    unzip(source, { dir }, function (err) {
      if (err) {
        reject(err);
      }
      else {
        resolve();
      }
    });
  });
}

async function save(pkgName, tag, downloadedPkg, saveLocation, pkgTemp) {
  try {
    // create temp
    await fs.ensureDir(pkgTemp);

    // download pkg in the temp directory
    const downloadTemp = path.resolve(pkgTemp, pkgName + '.zip');
    await fs.outputFile(downloadTemp, downloadedPkg);

    // extract
    await extract({ dir: pkgTemp, source: downloadTemp });

    await fs.copy(path.resolve(pkgTemp, pkgName + '-' + tag, 'index.js'), path.resolve(saveLocation, pkgName + '.js'));
    
    // remove temp
    await fs.remove(pkgTemp);
    
    return downloadedPkg;
  }
  catch (e) {
    await fs.remove(pkgTemp);
    throw e;
  }
}

async function install(pkgInfo, saveLocation, tempLocation) {
  const downloadPath = _.get(_.find(pkgInfo.tags, { version: pkgInfo.requestedTag }), 'path');
  const downloadedPkg = await downloader(downloadPath);
  return save(pkgInfo.name, pkgInfo.requestedTag, downloadedPkg, saveLocation, tempLocation);
}

function resolveVersion(version) {

  if (!version) return;

  const parts = version.split('.') || [];

  switch (parts.length) {
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


function parsePkgContent(binData) {
  try {
    return JSON.parse(binData.toString());
  }
  catch (e) {
    e.message += ' while trying to parse downloaded package info ' + e.message;
    throw e;
  }
}

async function pkgsInfo() {
  const downloaded = await downloader('https://raw.githubusercontent.com/nodearch/arch/master/package.json');
  const parsedContent = parsePkgContent(downloaded);
  return _.get(parsedContent, 'extensions');
}


module.exports = {
  install,
  pkgsInfo,
  resolveVersion
};
