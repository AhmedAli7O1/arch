'use strict';

const config = require('./config');
const fs = require('../utils/fs');
const path = require('path');
const paths = require('../text/paths.json');
const appConfig = require('../text/app.json');
const env = require('./env');
const log = require('../utils/log');
const loader = require('./loader');
const extension = require('./extension');
const arch = require('./arch');
const pkgInfo = require('../package.json');

class NodeArch {
  constructor (cli) {
    this.cli = cli;
    this.fs = fs;
    this.log = log;
    this.pkgInfo = pkgInfo;
    const appDir = this.getAppPath();
    this.paths = this._resolvePaths(paths, appDir);
    this.ENV = process.env.NODE_ENV = env(process.env.NODE_ENV, process.argv);
    this.paths.app = appDir;
    this.deps = {};
  }

  async init () {
    this.arch = await arch(this.paths.arch);
    this.config = await config.load(this.paths.config, this.ENV, !this.cli); 
  }

  async start (serverHandler) {
    try {
      this.log.info(`Node.js Server/Architecture Manager v${this.pkgInfo.version}`);
      this.log.info("http://www.nodearch.org");
      this.log.info(`Environment >> ${this.ENV}`);
      this.log.info('Started In', this.paths.app);
      this.log.info(`Started At >> ${Date()}`);

      await this.init();
      await extension.loadExtensions(this.paths.extensions);
      await extension.exec('before', this);
      await loader.loadPlugins(this.paths.api, this, 'deps');
      await serverHandler(this);
      await extension.exec('after', this);      
    }
    catch (e) {
      this.log.error(e);
      console.log(e.stack);
    }
  }

  _resolvePaths (pathsList, prefix) {
    const resolved = {};
  
    this.fs.resolvePaths(pathsList, prefix, (resolvedPath, key) => {
      resolved[key] = resolvedPath;
    });
  
    return resolved;
  }

  getAppPath () {
    const criteriaFn = function (dirPath = process.cwd()) {
      return fs.existsSync(path.join(dirPath, paths.arch));
    };
    return fs.searchUp(criteriaFn) || process.cwd();
  }

}

module.exports = NodeArch;