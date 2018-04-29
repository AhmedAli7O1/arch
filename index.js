'use strict';

const NodeArch = require('./lib/nodearch');
const path = require('path');
const _ = require('lodash');

const parentOfParent = _.get(module, 'parent.parent.filename');

let nodearch;

if (parentOfParent && path.basename(path.dirname(parentOfParent)) === 'bin') {
  nodearch = require('./bin/init');  
}
else {
  nodearch = new NodeArch({ dir: path.dirname(module.parent.filename) });
}

module.exports = nodearch;
