"use strict";


let isLogEnabled = true;

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",

  fgBlack: "\x1b[30m",
  fgRed: "\x1b[31m",
  fgGreen: "\x1b[32m",
  fgYellow: "\x1b[33m",
  fgBlue: "\x1b[34m",
  fgMagenta: "\x1b[35m",
  fgCyan: "\x1b[36m",
  fgWhite: "\x1b[37m",

  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m"
};


function print(color, ...args) {
  if (!isLogEnabled) return;

  let str = color + "";

  for (let i = 0; i < args.length; i++) {

    if (typeof args[i] === "object") {
      str += JSON.stringify(args[i], null, 2);
    }
    else {
      str += args[i];
    }

    if (i !== args.length - 1) {
      str += " ";
    }
    else {
      str += colors.reset;
    }
  }
  console.log(str);
}

function configureLog (config) {

  if (config.hasOwnProperty("enabled")) {
    isLogEnabled = config.enabled;
  }

}

function error(...args) {
  print(colors.fgRed, ...args);
}

function warn(...args) {
  print(colors.fgYellow, ...args);
}

function info(...args) {
  print(colors.fgGreen, ...args);
}

function debug(...args) {
  print(colors.fgBlue, ...args);
}



module.exports = {
  internals: {
    print,
    colors
  },
  error,
  warn,
  info,
  debug,
  config: configureLog
};
