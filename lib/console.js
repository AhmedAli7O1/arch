'use strict';

const repl = require('repl');

function init (arch) {
  return function () {
    arch.log.debug('starting in interactive console mode');
    repl.start('nodearch> ').context.arch = arch;
  }
}

module.exports = init;
