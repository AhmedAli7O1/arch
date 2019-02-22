"use strict";

const path = require("path");
const fs = require("./fs");
const config = require("../config.json");
const logger = require("./logger");


async function loadArchConfig (appPath) {

  const archConfigPath = path.join(appPath, config.archConfig.filename);
  let archConfig = {};

  try {
    archConfig = await fs.readFileAsync(archConfigPath);
    archConfig = JSON.parse(archConfig);
  }
  catch (e) {
    if (e instanceof SyntaxError) {
      throw new Error("invalid [ nodearch.json ] file content!");
    }
    else {
      logger.warn("couldn't find the configuration file [ nodearch.json ], continue with the defaults!");
    }
  }

  return Object.assign(config.archConfig.defaults, archConfig);
}

module.exports = loadArchConfig;
