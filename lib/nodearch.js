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
const _ = require('lodash');
const pipeline = require('./pipeline');

class NodeArch {
  constructor (options = {}) {
    this.noLog = options.noLog;
    this.fs = fs;
    this.log = log;
    this.pipeline = pipeline;
    this.pkgInfo = pkgInfo;
    this.paths = this._resolvePaths(paths, options.dir);
    this.ENV = process.env.NODE_ENV = env(process.env.NODE_ENV, process.argv);
    this.paths.app = options.dir;
    this.deps = {};
  }

  async init () {
    this.arch = await arch(this.paths.arch, this.noLog);
    this.config = await config.load(this.paths.config, this.ENV, this.noLog); 
  }

  async start (serverHandler) {
    try {

      if (!this.noLog) {
        this.log.info(`Node.js Server/Architecture Manager v${this.pkgInfo.version}`);
        this.log.info("http://www.nodearch.io");
        this.log.info(`Environment >> ${this.ENV}`);
        this.log.info('Started In', this.paths.app);
        this.log.info(`Started At >> ${Date()}`);
      }

      await this.init();
      await extension.loadExtensions(this.paths.extensions, _.get(this, 'arch.extensions') || []);
      await extension.exec('before', this);
      await loader.loadPlugins(this.paths.api, this, 'deps');
      await serverHandler(this);
      await extension.exec('after', this);      
    }
    catch (e) {
      this.log.error(e);
      if (!e.noStack) {
        console.log(e.stack);
      }
      process.exit(1);
    }
  }

  _resolvePaths (pathsList, prefix) {
    const resolved = {};
  
    this.fs.resolvePaths(pathsList, prefix, (resolvedPath, key) => {
      resolved[key] = resolvedPath;
    });
  
    return resolved;
  }

  getAppPath (startingDir) {
    const criteriaFn = function (dirPath = process.cwd()) {
      return fs.existsSync(path.join(dirPath, paths.arch));
    };
    return fs.searchUp(criteriaFn, startingDir) || process.cwd();
  }

}

module.exports = NodeArch;