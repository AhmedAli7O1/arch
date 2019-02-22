"use strict";

const { expect } = require("chai");
const utils = require("../lib/utils");


describe("utils", () => {

  describe("handleObjectPath", () => {
    it("should reject in case the provided path is not array of strings or a dotted string path", () => {
      expect(() => utils.internals.handleObjectPath({})).throw("path should be either dotted string or array of strings");
    });

    it("should handle array of strings as a path", () => {
      const result = utils.internals.handleObjectPath(["one", "two", "three", "four", "five"]);
      expect(result).to.deep.equal(["one", "two", "three", "four", "five"]);
    });

    it("should handle dotted string path", () => {
      const result = utils.internals.handleObjectPath("one.two.three.four.five");
      expect(result).to.deep.equal(["one", "two", "three", "four", "five"]);
    });
  });

  describe("set", () => {
    it("should set the provided object on the source object using the path", () => {
      const dataObj = {
        test: "test1",
        one: {
          h: "h1",
          two: {
            h: "h2"
          }
        }
      };

      const result = utils.set(dataObj, "one.two.three.four.five", { nestedTesting: "ntest" });

      expect(result).to.deep.equal({
        test: "test1",
        one: {
          h: "h1",
          two: {
            h: "h2",
            three: {
              four: {
                five: {
                  nestedTesting: "ntest"
                }
              }
            }
          }
        }
      });
    });

    it("should accept array of strings as a path", () => {
      const dataObj = {
        test: "test1",
        one: {
          h: "h1",
          two: {
            h: "h2"
          }
        }
      };

      const result = utils.set(dataObj, ["one", "two", "three", "four", "five"], { nestedTesting: "ntest" });

      expect(result).to.deep.equal({
        test: "test1",
        one: {
          h: "h1",
          two: {
            h: "h2",
            three: {
              four: {
                five: {
                  nestedTesting: "ntest"
                }
              }
            }
          }
        }
      });
    });

    it("should set all the attributes in the given object on the source object and keep existing attributes", () => {
      const dataObj = {
        test: "test1",
        one: {
          h: "h1",
          two: {
            h: "h2"
          },
          tt: { h: "h-" }
        }
      };

      const result = utils.set(dataObj, "one.two", { nestedTesting: "ntest" });

      expect(result).to.deep.equal({
        test: "test1",
        one: {
          h: "h1",
          two: {
            h: "h2",
            nestedTesting: "ntest"
          },
          tt: { h: "h-" }
        }
      });
    });
    
    it("should reject in case the provided path is not array of strings or a dotted string path", () => {
      const dataObj = {
        test: "test1"
      };

      expect(() => utils.set(dataObj, {}, {})).throw("path should be either dotted string or array of strings");
    });

    it("should handle an array as a value", () => {

      const obj = {
        hh: "dd",
        one: {
          two: {}
        }
      };

      const result = utils.set(obj, "one.two.three", ["item1", "item2"]);

      expect(result).to.deep.equal({
        hh: "dd",
        one: {
          two: {
            three: ["item1", "item2"]
          }
        }
      });
    });

    it("should set array items to existing array", () => {

      const obj = {
        hh: "dd",
        one: {
          two: {
            three: ["item1", "item2"]
          }
        }
      };

      const result = utils.set(obj, "one.two.three", ["item3", "item4"]);

      expect(result).to.deep.equal({
        hh: "dd",
        one: {
          two: {
            three: ["item1", "item2", "item3", "item4"]
          }
        }
      });
    });

    it("should handle string as a value to existing source attribute", () => {
      const obj = {
        hh: "hh1",
        one: {
          two: ""
        }
      };

      utils.set(obj, "one.two", "test1");
      expect(obj).to.deep.equal({
        hh: "hh1",
        one: {
          two: "test1"
        }
      });
    });

    it("should handle string as a value to non-existing source attribute", () => {
      const obj = {
        hh: "hh1",
        one: {
        }
      };

      utils.set(obj, "one.two", "test1");
      expect(obj).to.deep.equal({
        hh: "hh1",
        one: {
          two: "test1"
        }
      });
    });
  });

  describe("get", () => {

    const data = {
      one: {
        hh: "hh",
        two: {
          three: {
            four: {
              five: "5"
            }
          }
        }
      }
    };

    it("should get value from object by path", () => {
      const result = utils.get(data, "one.two.three.four.five");
      expect(result).to.equal("5");
    });

    it("should get nested object from object by path", () => {
      const result = utils.get(data, "one.two.three.four");
      expect(result).to.deep.equal({ five: "5" });
    });

    it("should get by array of strings instead of string dotted", () => {
      const result = utils.get(data, ["one", "two", "three", "four"]);
      expect(result).to.deep.equal({ five: "5" });
    });

    it("should return null in case of not exist path", () => {
      const result = utils.get(data, "one.two.no");
      expect(result).to.be.null;
    });

  });

});
