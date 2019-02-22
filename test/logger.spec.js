"use strict";

const logger = require("../lib/logger");
const sinon = require('sinon');
const chai = require("chai");
const util = require("util");

const { expect } = chai;

describe("logger", () => {
  beforeEach(() => {
    logger.config({ enabled: true });
    
    /*
     * stub console.log to prevent logging to the console while testing the logging
     * but doesn't interrupt any other functionality that uses the console.log function as well.
     * by filtring out any log starts with TEST7O1 and color red
    */
    sinon.stub(console, 'log').callsFake((...args) => {
      if (!args[0].match(/TEST7O1/g)) 
        process.stdout.write(util.format(...args) + '\n');
    });
  });

  afterEach(() => {
    console.log.restore();
    logger.config({ enabled: false });
  });

  describe("print", () => {

    it("should print to the console with specific color while logging is enabled", () => {
      logger.config({});

      logger.internals.print(logger.internals.colors.fgRed, "TEST7O1");
      expect(console.log.calledOnce).to.be.true;
    });

    it("shouldn't print to the console if the logging disabled", () => {
      logger.config({ enabled: false });

      logger.internals.print(logger.internals.colors.fgRed, "TEST7O1");
      expect(console.log.called).to.be.false;  
    });

    it("should combine multiple params into one string", () => {
      logger.internals.print(logger.internals.colors.fgRed, "TEST7O1", "one", "two");
      expect(console.log.calledWith("\u001b[31mTEST7O1 one two\u001b[0m")).to.be.true;
    });

    it("should print out js object", () => {
      logger.internals.print(logger.internals.colors.fgBlue, { test: "TEST7O1", one: "two" });
      expect(console.log.calledWith(`\u001b[34m{\n  "test": "TEST7O1",\n  "one": "two"\n}\u001b[0m`));
    });

  });

  describe("error", () => {
    it("should log to the console with red color", () => {
      logger.error("hello", "world", "TEST7O1");
      expect(console.log.calledWith("\u001b[31mhello world TEST7O1\u001b[0m")).to.be.true;
    });
  });

  describe("warn", () => {
    it("should log to the console with yellow color", () => {
      logger.warn("hello", "world", "TEST7O1");
      expect(console.log.calledWith("\u001b[33mhello world TEST7O1\u001b[0m")).to.be.true;
    });
  });

  describe("info", () => {
    it("should log to the console with green color", () => {
      logger.info("hello", "world", "TEST7O1");
      expect(console.log.calledWith("\u001b[32mhello world TEST7O1\u001b[0m")).to.be.true;
    });
  });

  describe("debug", () => {
    it("should log to the console with blue color", () => {
      logger.debug("hello", "world", "TEST7O1");
      expect(console.log.calledWith("\u001b[34mhello world TEST7O1\u001b[0m")).to.be.true;
    });
  });
});