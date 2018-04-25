'use strict';

const NodeArch = require('./lib/nodearch');
const path = require('path');

module.exports = new NodeArch({ dir: path.dirname(module.parent.filename) });
