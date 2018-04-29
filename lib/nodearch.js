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
const dependency = require('./dependency');
const EventEmitter = require('events');
const events = require('../text/events');
const archConsole = require('./console');

class NodeArch extends EventEmitter {
  constructor (options = {}) {
    super();
    this.noLog = options.noLog;
    this.fs = fs;
    this.log = log;
    this.console = archConsole(this);
    this.pipeline = pipeline;
    this.pkgInfo = pkgInfo;
    this.paths = this._resolvePaths(paths, options.dir);
    this.env = process.env.NODE_ENV = env(process.env.NODE_ENV, process.argv);
    this.paths.app = options.dir;
    this.deps = {};
  }

  async init () {
    this.arch = await arch(this.paths.arch, this.noLog);
    this.config = await config.load(this.paths.config, this.env, this.noLog); 
  }

  async start (serverHandler) {
    try {
      this.log.info(`Node.js Server/Architecture Manager v${this.pkgInfo.version}`);
      this.log.info("http://www.nodearch.io");
      this.log.info(`Environment >> ${this.env}`);
      this.log.info('Started In', this.paths.app);
      this.log.info(`Started At >> ${Date()}`);

      await this.init();
      await extension.loadExtensions(this.paths.extensions, _.get(this, 'arch.extensions') || []);
      await extension.exec('before', this);
      await loader.loadPlugins(this.paths.api, this, 'deps');
      await serverHandler(this);
      await extension.exec('after', this);
      this.emit(events.started);
    }
    catch (e) {
      this.log.error(e);
      if (!e.noStack) {
        console.log(e.stack);
      }
      process.exit(1);
    }
  }

  /**
   * get list of available modules or components from all plugins
   * @param {string} type module or component 
   * @param {string} name item name
   * @returns {Object[]}
   */
  getList (type, name) {
    return dependency.getList(this.deps, type, name);
  }

  // TODO
  // dependency (query) {
  // }

  // TODO: move this function from here
  _resolvePaths (pathsList, prefix) {
    const resolved = {};
  
    this.fs.resolvePaths(pathsList, prefix, (resolvedPath, key) => {
      resolved[key] = resolvedPath;
    });
  
    return resolved;
  }

  // TODO: move this function from here
  getAppPath (startingDir) {
    const criteriaFn = function (dirPath = process.cwd()) {
      return fs.existsSync(path.join(dirPath, paths.arch));
    };
    return fs.searchUp(criteriaFn, startingDir) || process.cwd();
  }

}

module.exports = NodeArch;