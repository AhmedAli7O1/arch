'use strict';

const request = require('request-promise');
const _ = require('lodash');
const decompress = require('decompress');
const downloader = require('./downloader');
const path = require('path');
const fs = require('fs-extra');
Promise = require('bluebird').Promise;
const npmHandler = require('./npm');
const log = require('../utils/log');

// https://raw.githubusercontent.com/nodearch/arch/master
// https://github.com/nodearch/${pkgName}/archive/${version}.zip
const pkgsTreeUrl = 'http://localhost:3000/testData/pkgs.json';
const pkgDownloadUrl = 'http://localhost:3000/testData/${pkgName}/${version}.zip';


async function exec() {
  // const result = await getPkgsInfo();
  // const downloaded = await download({ 
  //   pkgName: 'mocha', 
  //   version: '1.0.1', 
  //   //location: path.resolve(__dirname, 'downloadTest'),
  //   filter: file => file.path.match('index.js') || file.path.match('package.json'),
  //   strip: 1
  // });
  // await installDeps(downloaded, path.resolve(__dirname));


  // const result = await npmHandler.npmDeps(path.resolve(__dirname));

}

function pkgsInfo() {
  const options = {
    url: pkgsTreeUrl,
    method: 'GET',
    json: true
  };

  return request.get(options);
}

/**
 * 
 * @param {Object} param0
 * @example {
 *  pkgName: 'mocha',
 *  version: '1.0.1',
 *  location: path.resolve(__dirname, 'downloadTest'),
 *  filter: file => file.path.match('index.js') || file.path.match('package.json'),
 *  strip: 1
 * } 
 */
async function download({ pkgName, version, location, filter, strip = 0 }) {
  const downloadLink = _.template(pkgDownloadUrl)({ pkgName, version });
  const data = await downloader(downloadLink);
  return decompress(data, location, { filter: filter, strip: strip });
}

/**
 * save selected packages
 * @param {*} dataArray 
 * @param {*} filesToSave 
 * @param {*} location 
 * @example
 *  save(
 *    [
 *      {
          path: 'index.js',
          data: <Buffer 27> 
        }
      ],
      [
        {
          path: 'index.js',
          newPath: 'mocha.js'
        }
      ],
      '/home/user/project/extensions'
    );
 */
async function save(dataArray, filesToSave, location) {
  _.merge(dataArray, filesToSave);
  const filteredDataArray = _.filter(dataArray, x => _.includes(_.map(filesToSave, 'path'), x.path));
  return Promise.map(filteredDataArray, x => {
    return fs.outputFile(path.resolve(location, x.newPath || x.path), x.data);
  });
}

async function installDeps(dataArray, location) {

  let pkgsInfo = _.find(dataArray, x => x.path.match('package.json'));
  if (!pkgsInfo) return;

  pkgsInfo = parseJson(pkgsInfo.data);

  if (!pkgsInfo || _.isEmpty(pkgsInfo.dependencies)) return;

  const pkgsToInstall = _.map(pkgsInfo.dependencies, (value, key) => {
    return {
      name: key,
      version: value
    };
  });

  const existingDeps = await npmHandler.npmDeps(location);

  const { filtered, exist } = npmHandler.compareDeps(existingDeps, pkgsToInstall);

  if(!_.isEmpty(exist)) {
    let msg = `the following packages were requested, but you already have them installed:`;
    _.forEach(exist, x => {
      msg += `\npackage [ ${x.pkg} ]\t with the tag\t [ ${x.tag} ] -- requested ->`;
    });
    log.warn(msg);
  }

  if (!_.isEmpty(filtered)) {
    await npmHandler.npmInstall(filtered, location);
  }

}

function parseJson(data) {
  try {
    return JSON.parse(data.toString());
  }
  catch (e) {
    return null;
  }
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

async function remove(saveLocation, pkgName) {
  const pkgLocation = path.resolve(saveLocation, pkgName + '.js');
  return fs.remove(pkgLocation);
}

module.exports = {
  pkgsInfo,
  resolveVersion,
  remove,
  download,
  save,
  installDeps
};
