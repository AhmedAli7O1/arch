"use strict";

const path = require("path");
const source = require('./source.js');
const config = require("../config.json");
const fs = require("./fs");
const loader = require("./loader");
const logger = require("./logger");
const locations = require("./locations");
const archConfigLoader = require("./archConfig");

let deps = {}, filesInfo;


async function start (handler) {
  try {
    const appPath = locations.getAppDir(module);

    const archConfig = await archConfigLoader(appPath);

    logger.info("nodearch configurations loaded!");

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

    await handler();
  }
  catch (e) {
    logger.error(e.message);
    process.exit(1);
  }
}

module.exports = {
  start,
  deps,
  logger
};
