'use strict';

const _ = require('lodash');

function semver (a, b) {
  const pa = a.split('.');
  const pb = b.split('.');
  for (let i = 0; i < 3; i++) {
      const na = Number(pa[i]);
      const nb = Number(pb[i]);
      if (na > nb) return 1;
      if (nb > na) return -1;
      if (!isNaN(na) && isNaN(nb)) return 1;
      if (isNaN(na) && !isNaN(nb)) return -1;
  }
  return 0;
}

/**
 * does {a} compatiable with {b} ? 
 * Rules for compatibility
 * - it should be the same major version
 * - it should be grater than or equal minor version
 * - patch version is ignored
 */
function compatiable (a, b) {
  const pa = a.split('.');
  const pb = b.split('.');
  // console.log(pa[0] , pb[0]);
  if (pa[0] !== pb[0]) return false;
  return pa[1] <= pb[1];
}

module.exports = {
  semver,
  compatiable
};