'use strict';

const _ = require('lodash');

function _semverCompare (a, b) {
  var pa = a.split('.');
  var pb = b.split('.');
  for (var i = 0; i < 3; i++) {
      var na = Number(pa[i]);
      var nb = Number(pb[i]);
      if (na > nb) return 1;
      if (nb > na) return -1;
      if (!isNaN(na) && isNaN(nb)) return 1;
      if (isNaN(na) && !isNaN(nb)) return -1;
  }
  return 0;
}

function semver (...vers) {
  return _.last(vers.sort(_semverCompare));
}

module.exports = {
  semver
};