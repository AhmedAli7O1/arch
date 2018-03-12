'use strict';

const loader = require('../../lib/loader');
const path = require('path');
const { expect } = require("chai");


const TEST_DATA_LOC = path.resolve(__dirname, '..', '..', 'testData', 'structure');

const testStructure = path.join(TEST_DATA_LOC, "structureExample");
const testSpec = path.join(TEST_DATA_LOC, "specification.json");
//const structureInfoResult = require(path.join(TEST_DATA_LOC, "structure-info-result.json"));
//const loaderSchemaResult = require(path.join(TEST_DATA_LOC, "loader-schema-result.json"));

describe('lib/loader', () => {

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

});