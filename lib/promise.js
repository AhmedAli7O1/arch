'use strict';

async function mapAsync(array, cb) {
  return Promise.all(array.map(cb));
}

module.exports = {
  mapAsync
};
