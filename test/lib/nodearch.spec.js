'use strict';

const fs = require('fs-extra');
const path = require('path');
const NodeArch = require('../../lib/nodearch');
const exampleLoader = require('../../testHelper/exampleLoader');
const { expect } = require('chai');


describe('lib/nodearch', () => {

  const temp = path.resolve('./testTempArch');
  const advStructure = exampleLoader('adv-structure', { temp });
  const orderdSpecs = exampleLoader('orderd-specs', { temp });

  before(async () => {
    await Promise.map(advStructure, x => fs.outputFile(x.file, JSON.stringify(x.content)));
    await Promise.map(orderdSpecs, x => fs.outputFile(x.file, JSON.stringify(x.content)));
  });

  after(async () => {
    await fs.remove(temp);
  });

  describe('start()', () => {

    it('should start the server', async () => {
      const nodearch = new NodeArch({ dir: temp, noLog: true });
      await nodearch.start(() => { });
      expect(nodearch.deps).to.deep.equal(
        {
          pluginOne: {
            controllers: { TestController: {}, TestTwoController: {} },
            models: { TestModel: {} },
            services: { Test2Service: {}, TestService: {} },
            routes: {}
          },
          pluginTwo: {
            controllers: { Test2Controller: {}, TestController: {} },
            models: { TestModel: {} },
            services: { Test2Service: {}, TestService: {} },
            routes: {}
          }
        }
      );
    });

  });

});

