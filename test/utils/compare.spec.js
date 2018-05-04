'use strict';

const compare = require('../../utils/compare');
const { expect } = require('chai');


describe('utils/compare', () => {
  describe('semver()', () => {

    it('should return the higher version', () => {

      expect(compare.semver('1.0.0', '1.0.1')).to.equal(-1);
      expect(compare.semver('1.1.0', '1.0.1')).to.equal(1);
      expect(compare.semver('1.0.0', '1.2.0')).to.equal(-1);
      expect(compare.semver('2.0.0', '0.9.9')).to.equal(1);
      expect(compare.semver('3.2.0', '3.2.0')).to.equal(0);

    });

  });

  describe('compatiable()', ()=> {

    it('should return true as compatiable', () => {

      expect(compare.compatiable('1.0.0', '1.0.0')).to.equal(true);
      expect(compare.compatiable('1.0.0', '1.0.20')).to.equal(true);
      expect(compare.compatiable('1.0.0', '1.5.0')).to.equal(true);
      expect(compare.compatiable('1.0.0', '1.5.4')).to.equal(true);
      expect(compare.compatiable('1.3.0', '1.5.4')).to.equal(true);
      expect(compare.compatiable('1.3.60', '1.5.4')).to.equal(true);
      expect(compare.compatiable('1.4.5', '1.4.5')).to.equal(true);

    });

    it('should return false as not compatiable', () => {

      expect(compare.compatiable('2.0.0', '1.0.0')).to.equal(false);
      expect(compare.compatiable('1.5.0', '1.4.0')).to.equal(false);
      expect(compare.compatiable('1.5.0', '1.4.30')).to.equal(false);
      expect(compare.compatiable('0.5.0', '1.5.0')).to.equal(false);

    });

  });
});