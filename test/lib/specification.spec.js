"use strict";

const path = require("path");
const { expect } = require("chai");
const specification = require("../../lib/specification");

const TEST_DATA_LOC = path.resolve(__dirname, "..", "..", "testData", "loader");
const inputData = require(path.join(TEST_DATA_LOC, "input.json"));
const resultData = require(path.join(TEST_DATA_LOC, "result.json"));

describe("lib/specification", () => {
  describe("#compareSpecs()", () => {
    it("should return unique array of specs considering the order", () => {
      const spec = [
        {
          name: "one",
          type: "ss",
          path: ""
        },
        {
          name: "two",
          type: "",
          path: ""
        },
        {
          name: "four",
          type: "",
          path: ""
        }
      ];

      const spec2 = [
        {
          name: "one",
          type: "ee",
          path: ""
        },
        {
          name: "three",
          type: "",
          path: ""
        }
      ];

      const combinedSpecs = specification.compareSpecs(spec, spec2);

      expect(combinedSpecs).to.deep.equal([
        { name: "one", type: "ss", path: "" },
        { name: "two", type: "", path: "" },
        { name: "four", type: "", path: "" },
        { name: "three", type: "", path: "" }
      ]);

      const combinedSpecs2 = specification.compareSpecs(spec2, spec);

      expect(combinedSpecs2).to.deep.equal([
        { name: "one", type: "ee", path: "" },
        { name: "three", type: "", path: "" },
        { name: "two", type: "", path: "" },
        { name: "four", type: "", path: "" }
      ]);
    });
  });

  describe("#mergeSpec()", () => {
    it("should merge onDisk and specified Schema", () => {
      const result = specification.mergeSpec(inputData.spec, inputData.onDisk);

      expect(result).to.deep.equal(resultData);
    });
  });

  describe('#validateSchema()', () => {

    const userSchema = [
      {
        name: 'routes.js',
        type: 'module'
      },
      {
        name: 'controllers',
        type: 'component',
        modules: [{ name: 'TestController.js' }, { name: 'Test2Controller.js' }]
      },
      {
        name: 'test',
        type: 'component',
        disable: true
      }
    ];

    it('should return true for valid schema', () => {
      expect(specification.validateSchema(userSchema)).to.equal(true);
    });
  });
});
