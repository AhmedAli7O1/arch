'use strict';

const fse = require('fs-extra');
const path = require('path');
const { expect } = require('chai');
const configTest = require('../../lib/config')._test;

describe('lib/config', () => {
  describe('#load()', () => {
    const temp = path.resolve('./temp');

    const data = [
      `${temp}/connection.js`,
      `${temp}/mongo.json`,
      `${temp}/development`,
      `${temp}/development/connection.js`
    ];

    before(async () => {
      await Promise.all([
        fse.outputFile(
          data[0],
          'module.exports = { attrOne: "one", attrTwo: "two" }'
        ),
        fse.outputFile(data[1], '{ "attrTwo": "two" }'),
        fse.ensureDir(data[2]),
        fse.outputFile(
          data[3],
          'module.exports = { attrTwo: "two-dev", attrThree: "three" }'
        )
      ]);
    });

    it('should load common configurations', async () => {
      const result = await configTest.load(temp);

      expect(result).to.deep.equal({
        connection: {
          attrOne: 'one',
          attrTwo: 'two'
        },
        mongo: { attrTwo: 'two' }
      });
    });

    it('should load common and env configurations', async () => {
      const result = await configTest.load(temp, 'development');

      expect(result).to.deep.equal({
        connection: {
          attrOne: 'one',
          attrTwo: 'two-dev',
          attrThree: 'three'
        },
        mongo: { attrTwo: 'two' }
      });
    });

    after(async () => {
      await fse.remove(temp);
    });
  });
});
