'use strict';

const loader = require('../../lib/loader');
const path = require('path');
const { expect } = require("chai");
const fse = require('fs-extra');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const _ = require('lodash');
chai.use(chaiAsPromised);

const TEST_DATA_LOC = path.resolve(__dirname, '..', '..', 'testData', 'structure');

const testStructure = path.join(TEST_DATA_LOC, "structureExample");
const testSpec = path.join(TEST_DATA_LOC, "spec.json");

describe('lib/loader', () => {

  const userSpec = [
    {
      name: 'routes.js',
      type: 'module'
    },
    {
      name: 'controllers',
      type: 'component',
      modules: [{ name: 'Test2Controller.js' }]
    },
    {
      name: 'services',
      type: 'component',
      modules: [{ name: 'TestService.js' }]
    }
  ];

  const temp = path.resolve('./testTempLoader');

  const data = [
    `${temp}/pluginOne/routes.js`,
    `${temp}/pluginOne/services/TestService.js`,
    `${temp}/pluginOne/controllers/TestController.js`,
    `${temp}/pluginOne/models/TestModel.js`,
    `${temp}/pluginOne/controllers/Test2Controller.js`,
    `${temp}/pluginOne/services/Test2Service.js`
  ];

  before(async () => {
    const promiseArray = [];
    _.forEach(data, (x) => promiseArray.push(fse.ensureFile(x)));
    promiseArray.push(fse.outputFile(`${temp}/pluginOne/spec.json`, JSON.stringify(userSpec)));
    await Promise.all(promiseArray);
  });

  after(async () => {
    await fse.remove(temp);
  });

  it('loadPlugins()', async () => {
    const memoryObject = {};
    await loader.loadPlugins(TEST_DATA_LOC, memoryObject, 'deps');
    expect(memoryObject).to.deep.equal({
      "deps": {
        "structureExample": {
          "YY": {
            "fileYY1": {},
            "fileYY3": {},
            "fileYY2": {}
          },
          "XX": {
            "fileXX2": {},
            "fileXX3": {},
            "fileXX1": {}
          },
          "MM": {
            "fileMM1": {},
            "fileMM2": {},
            "fileMM3": {}
          },
          "OO": {
            "test": "test"
          }
        }
      }
    });
  });

  it('should load all modules and components within the api directory with the given order', async () => {
    const memoryObject = {};
    await loader.loadPlugins(temp, memoryObject, 'deps');
    expect(_.keys(_.get(memoryObject, 'deps.pluginOne'))).to.deep.equal([
      'routes',
      'controllers',
      'services',
      'models'
    ]);
    
    expect(_.keys(_.get(memoryObject, 'deps.pluginOne.controllers'))).to.deep.equal([
      'Test2Controller',
      'TestController'
    ]);
    
    expect(_.keys(_.get(memoryObject, 'deps.pluginOne.services'))).to.deep.equal([
      'TestService',
      'Test2Service'
    ]);
    
    expect(_.keys(_.get(memoryObject, 'deps.pluginOne.models'))).to.deep.equal(['TestModel']);
  });

});