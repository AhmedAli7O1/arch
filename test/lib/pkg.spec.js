'use strict';

const pkg = require('../../lib/pkg');
const { expect } = require("chai");
const path = require('path');
const fse = require('fs-extra');
const sinon = require('sinon');

describe('lib/pkg', () => {
  describe('download()', () => {

    const temp = path.resolve('./testTempPkg');

    const examplePkg = `
    'use strict';
    
    module.exports = {
      before: function () { console.log('do nothing';) },
      component: function () { console.log('do nothing';) },
      after: function () { console.log('do nothing';) },
    };

    `;

    it('should download the file in a specific location', async () => {

      // const pkgManager = pkg('https://raw.githubusercontent.com/nodearch/');

      // const requestStub = sinon.stub(pkgManager._test.downloader, 'get').resolves(examplePkg);

      // await pkgManager.download('mocha', '1.0.0', temp);

      // requestStub.restore();

      // const downloadedPkg = await fse.readFile(path.resolve(temp, 'mocha.js'), 'utf-8');

      // expect(downloadedPkg).to.equal(examplePkg);

    });

    it('resolve version numbers to a full form', async () => {
      const pkgManager = pkg('https://raw.githubusercontent.com/nodearch/');
      expect(pkgManager._test.resolveVersion('1.1.5')).to.equal('1.1.5');
    });

    it('resolve major and minor version numbers to a full form', async () => {
      const pkgManager = pkg('https://raw.githubusercontent.com/nodearch/');
      expect(pkgManager._test.resolveVersion('1.1')).to.equal('1.1.0');
    });

    it('resolve major version numbers to a full form', async () => {
      const pkgManager = pkg('https://raw.githubusercontent.com/nodearch/');
      expect(pkgManager._test.resolveVersion('1')).to.equal('1.0.0');
    });

    it('should throw error when resolving the version number', async () => {
      const pkgManager = pkg('https://raw.githubusercontent.com/nodearch/');
      expect(() => pkgManager._test.resolveVersion('1.0.0.0')).to.throw(Error);
    });

    after(async () => {
      await fse.remove(temp);
    });

  })
});