'use strict';

const fs = require('../utils/fs');
const paths = require('../text/paths.json');
const path = require('path');
const NodeArch = require('../lib/nodearch');


function getAppPath (startingDir) {
  const criteriaFn = function (dirPath = process.cwd()) {
    return fs.existsSync(path.join(dirPath, paths.arch));
  };
  return fs.searchUp(criteriaFn, startingDir);
}

const appDir = getAppPath();
const nodearch = new NodeArch({ noLog: true, dir: appDir || process.cwd() });

nodearch.cli = {
  app: appDir
};

module.exports = nodearch;