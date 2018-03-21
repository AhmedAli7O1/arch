'use strict';

const NodeArch = require('../lib/nodearch');
const cli = require('cli');

const nodearch = new NodeArch(true);
const pkg = require('./pkg')(nodearch);

cli.parse(
  {
    file: ['f', 'A file to process', 'file', 'asdasd'],           // -f, --file FILE   A file to process 
    time: ['t', 'An access time', 'time', false],                 // -t, --time TIME   An access time 
    work: [false, 'What kind of work to do', 'string', 'sleep']   //     --work STRING What kind of work to do 
  },
  {
    install: 'install nodearch extension'
  }
);

async function exec() {
  const nodearch = new NodeArch(true);

  nodearch.log.info(`Node.js Server/Architecture Manager v${nodearch.pkgInfo.version}`);
  nodearch.log.info(`Package Installer for NodeArch Extensions`);

  await nodearch.init();

  switch (cli.command) {
    case 'install':
      await pkg.install(cli.args);
      break;
  }

}



exec()
  .then()
  .catch(err => {
    nodearch.log.error(err.message);
    console.log(err.stack);
  });
