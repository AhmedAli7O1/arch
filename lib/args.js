"use strict";


function getArgs () {
  const args = process.argv.slice(2);
  const parsedArgs = {};
  
  for (let i = 0; i < args.length; i++) {
    const parts = args[i].split("=");
    parsedArgs[parts[0]] = parts[1];
  }

  return parsedArgs;
}

module.exports = getArgs;