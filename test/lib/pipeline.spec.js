'use strict';

const { expect } = require("chai");
const pipeline = require('../../lib/pipeline');

describe('lib/pipeline', () => {
  describe ('pipeline()', () => {

    it('should execute functions in order and execute the last one on success', async () => {
      
      const exec = pipeline(
        (data) => {
          data.counter += 5
        },
        
        (data) => {
          data.counter += 2
        },
      
        (data) => {
          return data.counter;
        }
      );

      const result = await exec({ counter: 0 });

      expect(result).to.equal(7);

    });

  });
});