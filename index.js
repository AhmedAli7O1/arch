'use strict';

const NodeArch = require('./lib/nodearch');
const path = require('path');
const _ = require('lodash');

const callerModule = _.get(module, 'parent.parent.filename');
const callerDirPath = callerModule ? path.dirname(callerModule) : null;
const callerDirName = callerDirPath ? path.basename(callerDirPath) : null;

let nodearch;

if (callerDirName === 'bin') {
  nodearch = require(path.join(callerDirPath, 'init'));
}
else {
  nodearch = new NodeArch({ dir: path.dirname(module.parent.filename) });
}

module.exports = nodearch;
