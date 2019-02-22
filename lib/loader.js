"use strict";

const path = require("path");
const utils = require("./utils");

function load({ filesInfo, deps, afterEach }) {
  for (let i = 0; i < filesInfo.length; i++) {
    utils.set(deps, filesInfo[i].relativePath.split(path.sep), require(filesInfo[i].path));

    if (afterEach) {
      afterEach(filesInfo[i], deps[filesInfo[i].name]);
    }
  }
}

module.exports = { load };
