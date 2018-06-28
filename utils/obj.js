'use strict';

/**
 * helpers
 * @module utils/obj
 */

const _ = require('lodash');

/**
 * convert an array to key - value object
 * @param {object[]} array of objects to convert
 * @param {string} key name of the attribute that will be used as key
 * @param {string} value name of the attribute that will be used as the value
 * @returns {object} converted object
 */
function arrayToObject (array, key, value) {
  const obj = {};

  _.forEach(array, (item) => {
    obj[item[key]] = item[value];
  });

  return obj;
}

function filterByAttr (arr, attr, values) {
  return _.filter(arr, x => {
    return _.includes(values, x[attr]);
  });
}

async function asyncMap (array, cb) {
  return await Promise.all(_.map(array, item => {
    return cb(item);
  }));
}

module.exports = {
  arrayToObject,
  filterByAttr,
  asyncMap
};
