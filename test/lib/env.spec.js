'use strict';

const env = require('../../lib/env');

const { expect } = require("chai");

describe('lib/env', () => {

  it('should detect the environment from args', () => {
    expect(env('one', ['env=one'])).to.equal('one');
  });

  it('should detect the environment from process', () => {
    expect(env('two')).to.equal('two');
  });

  it('should return the default environment', () => {
    expect(env()).to.equal('development');
  });

});
