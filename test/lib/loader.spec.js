'use strict';

const loader = require('../../lib/loader');
const path = require('path');

const TEST_DATA_LOC = path.resolve(__dirname, '..', '..', 'testData', 'structure');

const testStructure = path.join(TEST_DATA_LOC, "structureExample");
const testSpec = path.join(TEST_DATA_LOC, "specification.json");
//const structureInfoResult = require(path.join(TEST_DATA_LOC, "structure-info-result.json"));
//const loaderSchemaResult = require(path.join(TEST_DATA_LOC, "loader-schema-result.json"));

describe('lib/loader', () => {
  
  it('loadPlugin()', async () => {
    //const loadedPlugin =  await loader.loadPlugin(testStructure, testSpec);
    //console.log('loadedPlugin', loadedPlugin);
  });

  it('loadPlugins()', async () => {
    const loadedPlugins =  await loader.loadPlugins(TEST_DATA_LOC);
    //console.log('loadedPlugin', loadedPlugin);
  });

});