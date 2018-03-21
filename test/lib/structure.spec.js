'use strict';

const path = require('path');
const { expect } = require('chai');

const structure = require('../../lib/structure');
const TEST_DATA_LOC = path.resolve(__dirname, '..', '..', 'testData', 'structure');

const testStructure = path.join(TEST_DATA_LOC, "structureExample");
const testSpec = path.join(TEST_DATA_LOC, "structureExample", "spec.json");
const structureInfoResult = require(path.join(TEST_DATA_LOC, "structure-info-result.json"));
const loaderSchemaResult = require(path.join(TEST_DATA_LOC, "loader-schema-result.json"));

describe('lib/structure', () => {
  
  // describe('getStructureInfo()', async () => {
  //   it('should load both onDisk schema and specifications', async () => {
  //     const structureInfo = await structure.getStructureInfo(testStructure, testSpec);
  //     expect(structureInfo).to.deep.equal(structureInfoResult);
  //   });
  // });

  // describe('getPluginLoaderSchema()', () => {
  //   it('should return a loader schema for specifid specs and structure', async () => {
  //     const loaderSchema = await structure.getComponentsLoaderSchema(testStructure, testSpec);
  //     expect(loaderSchema).to.deep.equal(loaderSchemaResult);
  //   });
  // });

});