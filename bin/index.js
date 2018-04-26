#!/usr/bin/env node

'use strict';

const NodeArch = require('../lib/nodearch');
const cli = require('cli');
const fs = require('../utils/fs');
const path = require('path');
const paths = require('../text/paths.json');

const appDir = getAppPath();

const nodearch = new NodeArch({ noLog: true, dir: appDir || process.cwd() });
const pkg = require('./pkg')(nodearch);
const example = require('./example')(nodearch);


function getAppPath (startingDir) {
  const criteriaFn = function (dirPath = process.cwd()) {
    return fs.existsSync(path.join(dirPath, paths.arch));
  };
  return fs.searchUp(criteriaFn, startingDir);
}

function appNotExist () {
  nodearch.log.error(
    `cannot identify the current directory as a NodeArch App, 
    if this is your app directory, then place a nodearch.json file`
  );
}

function appIsExist () {
  nodearch.log.error(
    `the current directory or a parent directory in the path is already a NodeArch project.
    NodeArch project location is determined by the location of the nodearch.json file,
    and it's currently located at ${appDir}`
  );
}


cli.parse(
  {
    // file: ['f', 'A file to process', 'file', 'asdasd'],           // -f, --file FILE   A file to process 
    // time: ['t', 'An access time', 'time', false],                 // -t, --time TIME   An access time 
    // work: [false, 'What kind of work to do', 'string', 'sleep']   //     --work STRING What kind of work to do 
  },
  {
    add: 'add nodearch extension',
    remove: 'remove nodearch extension',
    generate: 'generate full and ready to go nodearch example'
  }
);

async function exec() {

  nodearch.log.info(`Node.js Server/Architecture Manager v${nodearch.pkgInfo.version}`);
  nodearch.log.info(`NodeArch CLI`);

  await nodearch.init();

  switch (cli.command) {
    case 'add':
      appDir ? await pkg.install(cli.args) : appNotExist();
      break;
    case 'remove':
      appDir ? await pkg.remove(cli.args) : appNotExist();
      break;
    case 'generate':
      appDir ? appIsExist() : await example.generate(cli.args);
      break;
  }

}



exec()
  .then()
  .catch(err => {
    nodearch.log.error(err.message);
    console.log(err.stack);
  });
