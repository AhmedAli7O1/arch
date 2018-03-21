'use strict';

const Joi = require('joi');


const schema = Joi.array().items({
  name: Joi.string()
});

module.exports = schema;