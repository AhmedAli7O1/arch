#!/usr/bin/env node

'use strict';

const NodeArch = require('../lib/nodearch');
const cli = require('cli');

const nodearch = new NodeArch({ noLog: true });
const pkg = require('./pkg')(nodearch);
const example = require('./example')(nodearch);

cli.parse(
  {
    // file: ['f', 'A file to process', 'file', 'asdasd'],           // -f, --file FILE   A file to process 
    // time: ['t', 'An access time', 'time', false],                 // -t, --time TIME   An access time 
    // work: [false, 'What kind of work to do', 'string', 'sleep']   //     --work STRING What kind of work to do 
  },
  {
    install: 'install nodearch extension',
    remove: 'remove nodearch extension',
    generate: 'generate a full and ready to try nodearch example'
  }
);

async function exec() {

  nodearch.log.info(`Node.js Server/Architecture Manager v${nodearch.pkgInfo.version}`);
  nodearch.log.info(`NodeArch CLI`);

  await nodearch.init();

  switch (cli.command) {
    case 'install':
      await pkg.install(cli.args);
      break;
    case 'remove':
      await pkg.remove(cli.args);
      break;
    case 'generate':
      await example.generate(cli.args);
      break;
  }

}



exec()
  .then()
  .catch(err => {
    nodearch.log.error(err.message);
    console.log(err.stack);
  });
