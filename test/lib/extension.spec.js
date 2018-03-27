'use strict';

const { expect } = require("chai");
const extension = require('../../lib/extension');
const path = require('path');
const fse = require('fs-extra');
const _ = require('lodash');
const sinon = require('sinon');

const testUtils = {
  outputTestBefore: (args) => args,
  outputTestComponent: (args) => args,
  outputTestAfter: (args) => args
};

global.testUtils = testUtils;

describe('lib/extension', () => {

  const temp = path.resolve('./testTempExts');

  const data = [
    {
      location: `${temp}/extOne.js`,
      content: `
      module.exports = {
        before: function () { testUtils.outputTestBefore('hello from before in extension one'); },
        component: function (...args) { testUtils.outputTestComponent(...args); },
        after: function () { testUtils.outputTestAfter('hello from after in extension one'); }
      };
      `
    },
    {
      location: `${temp}/extTwo.js`,
      content: `
      module.exports = {
        before: function () { testUtils.outputTestBefore('hello from before in extension two'); },
        component: function (...args) { testUtils.outputTestComponent(...args); },
        after: function () { testUtils.outputTestAfter('hello from after in extension two'); }
      };
      `
    }
  ];

  before(async () => {
    const promiseArray = [];
    _.forEach(data, (x) => promiseArray.push(fse.outputFile(x.location, x.content)));

    await Promise.all(promiseArray);
  });

  after(async () => {
    await fse.remove(temp);
  });

  it('should load extensions', async () => {
    const extensions = await extension.loadExtensions(temp, ["extOne", "extTwo"]);
    expect(_.get(extensions, 'before')).to.lengthOf(2);
  });

  describe('execute', () => {
    
    let sandbox;

    before(() => {
      sandbox = sinon.createSandbox(sinon.defaultConfig);
      sandbox.stub(testUtils, 'outputTestBefore');
      sandbox.stub(testUtils, 'outputTestComponent');
      sandbox.stub(testUtils, 'outputTestAfter');
    });

    after(() => {
      sandbox.restore();
    });

    it('should execute before extension event', async () => {
      await extension.exec('before');

      sinon.assert.callCount(testUtils.outputTestBefore, 2);
      sinon.assert.calledWith(
        testUtils.outputTestBefore,
        'hello from before in extension one'
      );
      sinon.assert.calledWith(
        testUtils.outputTestBefore,
        'hello from before in extension two'
      );

    });

    it('should execute after extension event', async () => {
      await extension.exec('after');

      sinon.assert.callCount(testUtils.outputTestAfter, 2);
      sinon.assert.calledWith(
        testUtils.outputTestAfter,
        'hello from after in extension one'
      );
      sinon.assert.calledWith(
        testUtils.outputTestAfter,
        'hello from after in extension two'
      );

    });

  });

});