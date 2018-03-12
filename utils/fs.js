'use strict';

/**
 * filesystem helpers module
 * @module utils/fs
 */

const fse = require('fs-extra');
const _ = require('lodash');
const path = require('path');

function Fs () {}

Fs.prototype = Object.create(fse);
Fs.prototype.formatFileArray = formatFileArray;
Fs.prototype.loadModules = loadModules;
Fs.prototype.dirContent = dirContent;
Fs.prototype.resolvePaths = resolvePaths;
Fs.prototype.canRead = canRead;
Fs.prototype.fileName = fileName;

/**
 * takes a file paths array and format it
 * then return an array of objects contains
 * all the available information about the files
 * @param {string[]} filesPath array of strings contains file paths
 * @returns {object[]} array of objects contains the files information
 * @instance
 */
function formatFileArray (filesPath) {
  return _.map(filesPath, (filePath) => {
    return {
      name: fileName(filePath),
      path: filePath,
      extension: path.extname(filePath).replace('.', '')
    };
  });
}

// load modules from the given paths array
function _loadModules (filesPath) {
  return _.map(filesPath, (filePath) => {
    return {
      path: filePath,
      /* eslint global-require: off */
      data: require(filePath)
    };
  });
}
// load and format modules
function _loadModulesAndFormat (filesPath) {
  // format the paths array to split information, e.g name, path, ext...etc
  const formattedPathsArray = formatFileArray(filesPath);

  // load all modules
  const modules = _loadModules(filesPath);

  // add the loaded modules data to the formatted array
  _.forEach(modules, (file) => {
    const formattedPath = _.find(
      formattedPathsArray,
      (x) => x.path === file.path
    );
    formattedPath.data = file.data;
  });

  return formattedPathsArray;

}


/**
 * load modules with the given paths array
 * @param {string[]} filesPath array of strings contains file paths
 * @param {boolean} format true if you want to format the returned module data object
 * @returns {object[]} array of objects contains the files content and path
 * in addition to extension and name if the param format >> true
 * @instance
 */
function loadModules (filesPath, format) {

  let result = null;
  const isArray = _.isArray(filesPath);

  if (!isArray) {
    filesPath = [filesPath];
  }

  if (format) {
    result = _loadModulesAndFormat(filesPath);
  }
  else {
    result = _loadModules(filesPath);
  }

  if (!isArray) {
    result = _.head(result);
  }

  return result;
}


/**
 * get the content of a given directory,
 * and return all sub folders and files
 * @param {string} location directory location
 * @return {object[]} array of objects contains
 * all the sub folders and files for the given directory
 * @instance
 */
async function dirContent (location) {
  const content = await this.readdir(location);
  const folders = [],
    files = [];

  _.forEach(content, (x) => {
    if (_.indexOf(x, '.') > -1) {
      files.push(x);
    }
    else {
      folders.push(x);
    }
  });

  return {
    folders,
    files
  };
}

/**
 * resolve an array of paths using a prefix
 * @param {string[]} paths string array contains paths to resolve
 * @param {string} prefix a prefix to resolve for all the given paths
 * @param {function} fn the handler function, will be called with each resolved path
 * @returns {string[]} array of strings represent the resolved paths
 * @instance
 */
function resolvePaths (paths, prefix, fn) {
  const resolved = [];
  _.forEach(paths, (pathInfo, key) => {
    const resolvedPath = path.resolve(prefix, pathInfo);
    if (_.isFunction(fn)) {
      fn(resolvedPath, key);
    }
    resolved.push(resolvedPath);
  });
  return resolved;
}

/**
 * check read permissions for the given file or directory path
 * @param {string} location file or directory path
 * @return {boolean} true if you have read access, otherwise false
 */
async function canRead (location) {
  try {
    await this.access(location, this.constants.R_OK);
    return true;
  }
  catch (e) {
    return false;
  }
}

/**
 * get the file name without the full path or the extension
 * @param {string} filePath file path
 * @return {string} the file name
 */
function fileName (filePath) {
  return path.basename(filePath, path.extname(filePath));
}

module.exports = new Fs();
