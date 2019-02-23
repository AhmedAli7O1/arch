"use strict";

const path = require("path");
const utils = require("./utils");
const { loaderError, before, after } = require("./extHooks");

async function load({ filesInfo, deps }) {
  for (let i = 0; i < filesInfo.length; i++) {
    await before();

    let loadedModule;

    try {
      loadedModule = require(filesInfo[i].path);
    }
    catch (e) {
      throw loaderError(e);
    }

    utils.set(deps, filesInfo[i].relativePath.split(path.sep), loadedModule);

    await after();
  }
}

module.exports = { load };
