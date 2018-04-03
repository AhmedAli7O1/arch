'use strict';

const compare = require('../../utils/compare');
const { expect } = require('chai');


describe('utils/compare', () => {
  describe('semver()', () => {

    it('should return the higher version', () => {

      expect(compare.semver('1.0.0', '1.0.1')).to.equal('1.0.1');
      expect(compare.semver('1.0.0', '1.2.0')).to.equal('1.2.0');
      expect(compare.semver('2.0.0', '0.9.9')).to.equal('2.0.0');
      expect(compare.semver('2.0.0', '0.9.9', '1.9.8', '4.1.1')).to.equal('4.1.1');

    });

  });
});