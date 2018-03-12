'use strict';

const { expect } = require('chai');
const paths = require('../../lib/paths');

describe('lib/paths', () => {
  describe('#getPath()', async () => {
    it('should get the given the path for the given attribute', () => {

      const pathsConfig = {
        plugins: "${app}/api",
        plugin: "${app}/api/${plugin}",
        pluginSpecs: "${app}/api/${plugin}/specification.js",
        see: {
          test: "${app}/api/${plugin}/specification.js"
        }
      };

      const getPath = paths(pathsConfig);

      const one = getPath('plugins', { app: 'rr' });
      const two = getPath('see.test', { app: 'rr', plugin: 'see' });

      expect(one).to.equal('rr/api');
      expect(two).to.equal('rr/api/see/specification.js');

    });
  });
});
