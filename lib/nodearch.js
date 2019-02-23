"use strict";

const path = require("path");
const source = require('./source.js');
const config = require("../config.json");
const loader = require("./loader");
const logger = require("./logger");
const locations = require("./locations");
const archConfigLoader = require("./archConfig");
const { before, after, generalError } = require("./extHooks");

let deps = {}, filesInfo;


async function start () {
  try {
    const appPath = locations.getAppDir(module);

    const archConfig = await archConfigLoader(appPath);

    logger.info("configurations loaded!");

    await before();

    filesInfo = await source
      .getFilesInfo(
        path.join(appPath, archConfig.appDir),
        path.join(appPath, archConfig.orderPath),
        config.supportedFileTypes
      );

    await loader.load({
      filesInfo,
      deps
    });

    await after();
  }
  catch (e) {
    logger.error(generalError(e));
    process.exit(1);
  }
}

module.exports = {
  start,
  deps,
  logger
};
