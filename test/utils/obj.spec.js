"use strict";

const objTest = require("../../utils/obj");
const { expect } = require("chai");

describe("utils/obj", () => {
  describe("arrayToObject()", () => {
    it("should transform array to object using key & value", () => {
      const data = [
        { name: "fileOne", path: "/file-one" },
        { name: "fileTwo", path: "/file-two" },
        { name: "fileThree", path: "/file-three" }
      ];

      const result = objTest.arrayToObject(data, "name", "path");

      expect(result).to.deep.equal({
        fileOne: "/file-one",
        fileTwo: "/file-two",
        fileThree: "/file-three"
      });
    });
  });

  describe("asyncMap()", () => {
    it("should map", async () => {
      // blocking function
      async function blocking(text) {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(text + " edited");
          }, 10);
        });
      }

      const textArr = ["one", "two", "three", "four", "five"];

      const result = await objTest.asyncMap(textArr, blocking);

      expect(result).to.deep.equal([
        "one edited",
        "two edited",
        "three edited",
        "four edited",
        "five edited"
      ]);

    });
  });
});
