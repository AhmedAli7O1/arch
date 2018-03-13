'use strict';

function pipeline (...pipes) {
  return async function (...args) {
    
    for (const x of _.initial(pipes)) {
      await x(args);
    }
    return await _.last(pipes)(args);
  }
}

module.exports = pipeline;