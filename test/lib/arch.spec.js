'use strict';

const { expect } = require("chai");
const arch = require('../../lib/arch');
const exampleLoader = require('../../testHelper/exampleLoader');
const path = require('path');
const fs = require('fs-extra');

describe('lib/arch', () => {

  const temp = path.resolve('./testTempArch');

  before(async () => {
    const archFile = exampleLoader('arch', { temp });
    await Promise.map(archFile, x => fs.outputFile(x.file, JSON.stringify(x.content)));
  });

  after(async () => {
    await fs.remove(temp);
  });

  it('should load arch config', async () => {
    const result = await arch(path.resolve(temp, 'arch.json'));
    expect(result).to.deep.equal({ extensions: [ 'mocha', 'mongoose' ] });
  });
  
});
