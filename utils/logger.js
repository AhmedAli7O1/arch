'use strict';

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, prettyPrint, printf } = format;

const archFormat = printf(info => {
  return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});

function create(options = {}) {
  return createLogger({
    level: options.level || 'silly',
    format: combine(
      format.colorize(),
      label({ label: 'ARCH' }),
      timestamp(),
      prettyPrint(),
      archFormat()
    ),
    transports: [
      new transports.Console()
    ]
  });
}

module.exports = create;
