"use strict";

const _ = require("lodash");
const Joi = require('joi');
const validationSchema = require('../schema/specification');

function validateSchema (userSchema) {
  const result = Joi.validate(userSchema, validationSchema);

  if (result.error) {
    result.error.message = error({
      location: 'arc loader - specification schema validator',
      description: result.error.message
    });
    throw result.error;
  }
  else {
    return true;
  }
}

function compareSpecs(firstSpec, secondSpec) {
  return _.unionBy(firstSpec, secondSpec, "name");
}

function mergeSpec(spec, onDisk) {
  return _(spec)
    .map(sp => {
      sp.modules = sp.modules || [];

      const onDiskSpec = _.find(onDisk, { name: sp.name });

      if (onDiskSpec) {
        sp.modules = _.unionBy(sp.modules, onDiskSpec.modules, "name");
      }

      return sp;
    })
    .unionBy(onDisk, "name")
    .value();
}

module.exports = { compareSpecs, mergeSpec, validateSchema };
