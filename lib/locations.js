"use strict";

const path = require("path");
const utils = require("./utils");

function getAppDir (moduleObj) {
  return path.dirname(utils.get(moduleObj, "parent.parent.filename"));
}


module.exports = {
  getAppDir
};
