'use strict';

/**
 * error formatter
 * @module lib/error
 */

module.exports = function ({
  location,
  description
}) {
  return `
    location: ${location}
    description: ${description}
  `;
};