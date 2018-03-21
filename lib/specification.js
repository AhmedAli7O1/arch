"use strict";

const _ = require("lodash");
const Joi = require('joi');
const componentsValidationSchema = require('../schema/components.js');
const pluginsValidationSchema = require('../schema/plugins.js');

function validateComponentsSpec (userSchema) {
  return validateSchema(userSchema, componentsValidationSchema, 'specification schema validator for components');
}

function validatePluginsSpec (userSchema) {
  return validateSchema(userSchema, pluginsValidationSchema, 'specification schema validator for plugins');
}

function validateSchema (userSchema, definedSchema, msg) {
  const result = Joi.validate(userSchema, definedSchema);

  if (result.error) {

    result.error.message = ` 
    where: ${msg}
    reason: ${result.error.message}
    user schema: ${JSON.stringify(userSchema)}
    `;

    result.error.noStack = true;

    throw result.error;
  }
  else {
    return true;
  }

}

function compareSpecs(firstSpec, secondSpec) {
  return _.unionBy(firstSpec, secondSpec, "name");
}

function mergeComponentsSpec(spec, onDisk) {
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

function mergePluginsSpec(spec, onDisk) {
  return _(spec)
    .unionBy(onDisk, "name")
    .value();
}

module.exports = { compareSpecs, mergeComponentsSpec, mergePluginsSpec, validateComponentsSpec, validatePluginsSpec };
