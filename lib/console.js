'use strict';

const repl = require('repl');

function init (arch) {
  return function () {
    arch.logger.debug('starting in interactive console mode');
    arch.logger.debug('you can access all of your dependencies and arch tools by typing nodearch');
    repl.start('nodearch> ').context.nodearch = arch;
  }
}

module.exports = init;
