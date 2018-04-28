'use strict';

const _ = require('lodash');
const allowedTypes = ['module', 'component'];

function getList (deps, type, itemName) {

  const allowedLists = getKeys(deps);

  validation(allowedTypes, allowedLists, type, itemName);

  const itemList = getItems(deps, itemName);

  if (type === allowedTypes[0]) return itemList;

  return getValues(itemList);

}

function getItems (deps, itemName) {
  return _.chain(deps)
    .map(itemName)
    .flatten()
    .compact()
    .value();
}

function getKeys (data) {
  return _.chain(data)
    .map(x => _.keys(x))
    .flatten()
    .uniq()
    .compact()
    .value();
}

function getValues (data) {
  return _.chain(data)
    .map(x => _.values(x))
    .flatten()
    .uniq()
    .compact()
    .value();
}

function validation (allowedTypes, allowedLists, type, itemName) {
  
  if (!_.includes(allowedTypes, type)) {
    throw new Error(
      `the type ${type} is not allowed to use with the getList Function.
      please use one of ${allowedTypes}`
    );
  }

  if (!_.includes(allowedLists, itemName)) {
    throw new Error (
      `${itemName} is not allowed to use with the getList Function.
      please use one of ${allowedLists}`
    );
  }

}

module.exports = {
  getList,
  getItems,
  getKeys,
  getValues,
  validation
};
