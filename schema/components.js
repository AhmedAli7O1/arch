'use strict';

const Joi = require('joi');


const schema = Joi.array().items({
  name: Joi.string(),
  type: Joi.string().valid('module', 'component'),
  disable: Joi.boolean(),
  modules: Joi.array()
    .items({ name: Joi.string() })
    .when('type', {
      is: 'component',
      then: Joi.optional(),
      otherwise: Joi.forbidden()
    })
});

module.exports = schema;