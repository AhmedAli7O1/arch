'use strict';

const { spawn } = require('child_process');
const _ = require('lodash');
const bluebirdPromise = require('bluebird').Promise;
const fs = require('../utils/fs');
const path = require('path');
const log = require('../utils/log');

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const flags = {
  dev: '--save-dev',
  global: '-g',
  dep: '--save'
}


function npmInstallWithFlag(pkgs, flag, location) {
  return new Promise((resolve, reject) => {

    // const command = spawn('npm', _.union(['install', `--prefix ${location}`, flag], pkgs), { stdio: 'inherit' });
    const command = spawn(npm, _.union(['install', flag], pkgs), { stdio: 'inherit', cwd: location });

    command.on('error', (error) => {
      reject(error);
    });

    command.on('close', (code) => {
      if (code === 0) {
        resolve();
      }
    });

  });
}

function install (location) {
  return new Promise((resolve, reject) => {

    const command = spawn(npm, ['install'], { stdio: 'inherit', cwd: location });

    command.on('error', (error) => {
      reject(error);
    });

    command.on('close', (code) => {
      if (code === 0) {
        resolve();
      }
    });

  });
}


/**
 * install list of npm packages
 * @example [{
    name: 'lodash',
    version: '1.1.0',
    type: 'dep' // dep, dev or global "default -> dep"
  }],
  '/home/user/project'
 * @param {Object[]} pkgs list of packages
 * @param {String} location 
 */
function npmInstall(pkgs, location) {
  const pkgsInstallData = [];

  pkgs = _.map(pkgs, pkg => {
    if (!pkg.type) {
      pkg.type = 'dep';
    }
    if (pkg.version) {
      pkg.name = pkg.name + '@' + pkg.version;
    }
    return pkg;
  });

  _.forEach(flags, (flag, key) => {
    const pk = _.remove(pkgs, { type: key });
    if (_.isEmpty(pk)) return;
    pkgsInstallData.push({
      pkgs: _.map(pk, 'name'),
      flag
    });
  });

  return bluebirdPromise.map(pkgsInstallData, x => {
    return npmInstallWithFlag(x.pkgs, x.flag, location);
  });

}

function parseJson (data) {
  try {
    return JSON.parse(data.toString());
  }
  catch (e) {
    return null;
  }
}

async function npmDeps(location) {
  let pkgInfo = await fs.readFile(path.resolve(location, 'package.json'));
  pkgInfo = parseJson(pkgInfo);
  return pkgInfo.dependencies;
}

function compareDeps (existing, toInstall) {

  const filtered = [];
  const exist = [];

  _.forEach(toInstall, pkg => {
    const existPkg = existing[pkg.name];
    if (existPkg) {
      exist.push({ pkg: pkg.name, existTag: existPkg, requestedTag: pkg.version });
    }
    else {
      filtered.push(pkg);
    }
  });

  return { filtered, exist };

}

module.exports = {
  install,
  npmInstall,
  npmDeps,
  compareDeps
};
