"use strict";

const config = require("../config");
const logger = require("../lib/logger");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const sinon = require('sinon');
const source = require("../lib/source");
const fs = require("../lib/fs");
const os = require("os");
const path = require("path");


logger.config({ enabled: false });
chai.use(chaiAsPromised);
const { expect } = chai;
const osTmpDir = os.tmpdir();
const sep = path.sep;


describe("source", () => {

  let tmpDir, sourceDir;

  before(async () => {
    tmpDir = await fs.mkdtempAsync(`${osTmpDir}${sep}`);
    sourceDir = path.join(tmpDir, "sourceDir");
  });

  after(async () => {
    if (tmpDir) {
      await fs.removeDirAsync(tmpDir);
    }
  });


  describe("getDirContent", () => {

    before(async () => {
      await fs.mkdirAsync(sourceDir);

      await Promise.all([
        fs.mkdirAsync(path.join(sourceDir, "folderOne")),
        fs.mkdirAsync(path.join(sourceDir, "folderTwo")),
        fs.writeFileAsync(path.join(sourceDir, "fileOne.js"), ""),
        fs.writeFileAsync(path.join(sourceDir, "fileTwo.js"), ""),
        fs.writeFileAsync(path.join(sourceDir, "exttest-file.ee"), ""),
        fs.writeFileAsync(path.join(sourceDir, "exttest-file"), "")
      ]);
    });

    after(async () => {
      await fs.removeDirAsync(sourceDir);
    });

    let result, files, folders;

    it("will get files and folders on disk", async () => {

      sinon.replace(config, "supportedFileTypes", [".js"]);

      result = await source.internals.getDirContent(sourceDir);
      expect(result).to.not.equal(null);

      files = result.filter(item => {
        return item.type === "file";
      });

      folders = result.filter(item => {
        return item.type === "dir";
      });

      expect(files).to.not.empty;
      expect(folders).to.not.empty;

      sinon.restore();
    });

    it("will only get supported files", async () => {

      expect(files).to.not.empty;

      const loadedTypes = files
        .map(item => {
          return item.ext;
        })
        .filter((v, i, self) => {
          return self.indexOf(v) === i;
        });

      expect(loadedTypes).to.deep.equal([".js"]);
    });

    it("can read directory content info ( 1 level ) correctly", async () => {

      expect(result).to.not.equal(null);
      expect(result.length).to.equal(4);

      expect(result[0].base).to.equal("fileOne.js");
      expect(result[0].name).to.equal("fileOne");
      expect(result[0].type).to.equal("file");
      expect(result[0].ext).to.equal(".js");
      expect(result[0].path).to.equal(path.join(sourceDir, "fileOne.js"));

      expect(result[1].base).to.equal("fileTwo.js");
      expect(result[1].name).to.equal("fileTwo");
      expect(result[1].type).to.equal("file");
      expect(result[1].ext).to.equal(".js");
      expect(result[1].path).to.equal(path.join(sourceDir, "fileTwo.js"));

      expect(result[2].base).to.equal("folderOne");
      expect(result[2].name).to.equal("folderOne");
      expect(result[2].type).to.equal("dir");
      expect(result[2].ext).to.equal("");
      expect(result[2].path).to.equal(path.join(sourceDir, "folderOne"));

      expect(result[3].base).to.equal("folderTwo");
      expect(result[3].name).to.equal("folderTwo");
      expect(result[3].type).to.equal("dir");
      expect(result[3].ext).to.equal("");
      expect(result[3].path).to.equal(path.join(sourceDir, "folderTwo"));

    });

  });

  describe("getSourceContent", () => {

    before(async () => {

      await fs.mkdirAsync(sourceDir);

      await Promise.all([
        fs.mkdirAsync(path.join(sourceDir, "folderOne")),
        fs.mkdirAsync(path.join(sourceDir, "folderTwo")),
        fs.writeFileAsync(path.join(sourceDir, "fileOne.js"), ""),
        fs.writeFileAsync(path.join(sourceDir, "fileTwo.js"), "")
      ]);

      await Promise.all([
        fs.mkdirAsync(path.join(sourceDir, "folderOne", "Sub3")),
        fs.mkdirAsync(path.join(sourceDir, "folderTwo", "2Sub3")),

        fs.writeFileAsync(path.join(sourceDir, "folderOne", "file1.js"), ""),
        fs.writeFileAsync(path.join(sourceDir, "folderOne", "file2.js"), ""),
        fs.writeFileAsync(path.join(sourceDir, "folderOne", "file3.js"), ""),
        fs.writeFileAsync(path.join(sourceDir, "folderOne", "file4.js"), ""),

        fs.writeFileAsync(path.join(sourceDir, "folderTwo", "2file1.js"), ""),
        fs.writeFileAsync(path.join(sourceDir, "folderTwo", "2file2.js"), ""),
        fs.writeFileAsync(path.join(sourceDir, "folderTwo", "2file3.js"), ""),
        fs.writeFileAsync(path.join(sourceDir, "folderTwo", "2file4.js"), ""),
      ]);

      await Promise.all([
        fs.mkdirAsync(path.join(sourceDir, "folderTwo", "2Sub3", "3Sub4")),

        fs.writeFileAsync(path.join(sourceDir, "folderOne", "Sub3", "3file1.js"), ""),
        fs.writeFileAsync(path.join(sourceDir, "folderOne", "Sub3", "3file2.js"), ""),
        fs.writeFileAsync(path.join(sourceDir, "folderOne", "Sub3", "3file3.js"), ""),
        fs.writeFileAsync(path.join(sourceDir, "folderOne", "Sub3", "3file4.js"), ""),
      ]);

      await Promise.all([
        fs.writeFileAsync(path.join(sourceDir, "folderTwo", "2Sub3", "3Sub4", "4file1.js"), ""),
        fs.writeFileAsync(path.join(sourceDir, "folderTwo", "2Sub3", "3Sub4", "4file2.js"), ""),
        fs.writeFileAsync(path.join(sourceDir, "folderTwo", "2Sub3", "3Sub4", "4file3.js"), ""),
        fs.writeFileAsync(path.join(sourceDir, "folderTwo", "2Sub3", "3Sub4", "4file4.js"), ""),
      ]);

    });

    after(async () => {
      await fs.removeDirAsync(sourceDir);
    });

    it("can read the source directory content ( All Levels ) correctly", async () => {
      sinon.replace(config, "supportedFileTypes", [".js"]);

      const result = await source.internals.getSourceContent(sourceDir);

      const parsedPath = path.parse(sourceDir);

      const expectedResult = [
        {
          root: parsedPath.root,
          dir: sourceDir,
          base: 'fileOne.js',
          ext: '.js',
          name: 'fileOne',
          path: path.join(sourceDir, "fileOne.js"),
          type: 'file'
        },
        {
          root: parsedPath.root,
          dir: sourceDir,
          base: 'fileTwo.js',
          ext: '.js',
          name: 'fileTwo',
          path: path.join(sourceDir, "fileTwo.js"),
          type: 'file'
        },
        {
          root: parsedPath.root,
          dir: sourceDir,
          base: 'folderOne',
          ext: '',
          name: 'folderOne',
          path: path.join(sourceDir, "folderOne"),
          type: 'dir'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderOne"),
          base: 'file1.js',
          ext: '.js',
          name: 'file1',
          path: path.join(sourceDir, "folderOne", "file1.js"),
          type: 'file'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderOne"),
          base: 'file2.js',
          ext: '.js',
          name: 'file2',
          path: path.join(sourceDir, "folderOne", "file2.js"),
          type: 'file'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderOne"),
          base: 'file3.js',
          ext: '.js',
          name: 'file3',
          path: path.join(sourceDir, "folderOne", "file3.js"),
          type: 'file'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderOne"),
          base: 'file4.js',
          ext: '.js',
          name: 'file4',
          path: path.join(sourceDir, "folderOne", "file4.js"),
          type: 'file'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderOne"),
          base: 'Sub3',
          ext: '',
          name: 'Sub3',
          path: path.join(sourceDir, "folderOne", "Sub3"),
          type: 'dir'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderOne", "Sub3"),
          base: '3file1.js',
          ext: '.js',
          name: '3file1',
          path: path.join(sourceDir, "folderOne", "Sub3", "3file1.js"),
          type: 'file'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderOne", "Sub3"),
          base: '3file2.js',
          ext: '.js',
          name: '3file2',
          path: path.join(sourceDir, "folderOne", "Sub3", "3file2.js"),
          type: 'file'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderOne", "Sub3"),
          base: '3file3.js',
          ext: '.js',
          name: '3file3',
          path: path.join(sourceDir, "folderOne", "Sub3", "3file3.js"),
          type: 'file'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderOne", "Sub3"),
          base: '3file4.js',
          ext: '.js',
          name: '3file4',
          path: path.join(sourceDir, "folderOne", "Sub3", "3file4.js"),
          type: 'file'
        },
        {
          root: parsedPath.root,
          dir: sourceDir,
          base: 'folderTwo',
          ext: '',
          name: 'folderTwo',
          path: path.join(sourceDir, "folderTwo"),
          type: 'dir'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderTwo"),
          base: '2file1.js',
          ext: '.js',
          name: '2file1',
          path: path.join(sourceDir, "folderTwo", "2file1.js"),
          type: 'file'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderTwo"),
          base: '2file2.js',
          ext: '.js',
          name: '2file2',
          path: path.join(sourceDir, "folderTwo", "2file2.js"),
          type: 'file'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderTwo"),
          base: '2file3.js',
          ext: '.js',
          name: '2file3',
          path: path.join(sourceDir, "folderTwo", "2file3.js"),
          type: 'file'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderTwo"),
          base: '2file4.js',
          ext: '.js',
          name: '2file4',
          path: path.join(sourceDir, "folderTwo", "2file4.js"),
          type: 'file'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderTwo"),
          base: '2Sub3',
          ext: '',
          name: '2Sub3',
          path: path.join(sourceDir, "folderTwo", "2Sub3"),
          type: 'dir'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderTwo", "2Sub3"),
          base: '3Sub4',
          ext: '',
          name: '3Sub4',
          path: path.join(sourceDir, "folderTwo", "2Sub3", "3Sub4"),
          type: 'dir'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderTwo", "2Sub3", "3Sub4"),
          base: '4file1.js',
          ext: '.js',
          name: '4file1',
          path: path.join(sourceDir, "folderTwo", "2Sub3", "3Sub4", "4file1.js"),
          type: 'file'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderTwo", "2Sub3", "3Sub4"),
          base: '4file2.js',
          ext: '.js',
          name: '4file2',
          path: path.join(sourceDir, "folderTwo", "2Sub3", "3Sub4", "4file2.js"),
          type: 'file'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderTwo", "2Sub3", "3Sub4"),
          base: '4file3.js',
          ext: '.js',
          name: '4file3',
          path: path.join(sourceDir, "folderTwo", "2Sub3", "3Sub4", "4file3.js"),
          type: 'file'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderTwo", "2Sub3", "3Sub4"),
          base: '4file4.js',
          ext: '.js',
          name: '4file4',
          path: path.join(sourceDir, "folderTwo", "2Sub3", "3Sub4", "4file4.js"),
          type: 'file'
        }
      ];

      expect(result).to.not.be.empty;
      expect(result.length).to.equal(expectedResult.length);

      const recordsMatch = expectedResult.filter(item => {
        return result.find(resultItem => {
          return item.path === resultItem.path &&
            item.root === resultItem.root &&
            item.dir === resultItem.dir &&
            item.base === resultItem.base &&
            item.ext === resultItem.ext &&
            item.name === resultItem.name &&
            item.type === resultItem.type;
        });
      });

      expect(recordsMatch.length).to.equal(expectedResult.length);

      sinon.restore();
    });

    it("should throw error if directory path not exist", async () => {
      const result = source.internals.getSourceContent(path.join(sourceDir, "notExist"));
      expect(result).to.not.be.rejectedWith("couldn't read the source files info @ *");
    });

  });

  describe("getOrder", () => {

    let orderPath;

    before(async () => {
      await fs.mkdirAsync(sourceDir);
      orderPath = path.join(sourceDir, "order.json");
    });

    after(async () => {
      await fs.removeDirAsync(sourceDir);
    });

    it("should load order.json", async () => {
      await fs.writeFileAsync(orderPath, `["aa1/ee1.js","aa2/ee2.js", "aa4/ee4.js", "aa3/ee3.js"]`);

      const result = await source.internals.getOrder(orderPath);
      expect(result).to.deep.equal([
        path.join(sourceDir, "aa1/ee1.js"),
        path.join(sourceDir, "aa2/ee2.js"),
        path.join(sourceDir, "aa4/ee4.js"),
        path.join(sourceDir, "aa3/ee3.js")
      ]);

      await fs.unlinkAsync(orderPath);
    });

    it("should terminate with proper error message in case of invalid ( order.json )", async () => {
      await fs.writeFileAsync(orderPath, "aaa");

      const result = source.internals.getOrder(orderPath);

      await expect(result).to.be.rejectedWith("couldn't parse ( order.json ), invalid json!");

      await fs.unlinkAsync(orderPath);
    });

    it("should terminate with proper error message in case of invalid ( order.json ) content", async () => {
      await fs.writeFileAsync(orderPath, "{}");

      const result = source.internals.getOrder(orderPath);

      await expect(result).to.be.rejectedWith("invalid ( order.json ) content expected to find an array of strings");

      await fs.unlinkAsync(orderPath);
    });

    it("should return empty array in case of empty ( order.json )", async () => {
      await fs.writeFileAsync(orderPath, "");
      expect(await source.internals.getOrder(orderPath)).to.deep.equal([]);
      await fs.unlinkAsync(orderPath);
    });

    it("should return empty array in case of empty array in ( order.json )", async () => {
      await fs.writeFileAsync(orderPath, "[]");
      expect(await source.internals.getOrder(orderPath)).to.deep.equal([]);
      await fs.unlinkAsync(orderPath);
    });

    it("should return empty array in case of ( order.json ) doesn't exist on the disk", async () => {
      expect(await source.internals.getOrder(orderPath)).to.deep.equal([]);
    });

    it("should log warning to the console in case of empty ( order.json )", async () => {
      sinon.spy(logger, "warn");
      await fs.writeFileAsync(orderPath, "");
      await source.internals.getOrder(orderPath);
      expect(logger.warn.called).to.be.true;
      await fs.unlinkAsync(orderPath);
      logger.warn.restore();
    });

    it("should log warning to the console in case of empty array in ( order.json )", async () => {
      sinon.spy(logger, "warn");
      await fs.writeFileAsync(orderPath, "[]");
      await source.internals.getOrder(orderPath);
      expect(logger.warn.called).to.be.true;
      await fs.unlinkAsync(orderPath);
      logger.warn.restore();
    });

    it("should log warning message to the console in case of ( order.json ) doesn't exist on the disk", async () => {
      sinon.spy(logger, "warn");

      await source.internals.getOrder(orderPath);

      expect(logger.warn.called).to.be.true;

      logger.warn.restore();
    });
  });

  describe("isDirSameOrParent", () => {

    it("should return true in case of the same directory", () => {
      const result = source.internals.isDirSameOrParent(
        path.join("one", "two", "three"),
        path.join("one", "two", "three")
      );

      expect(result).to.be.true;
    });

    it("should return true in case of a parent directory", () => {
      const result = source.internals.isDirSameOrParent(
        path.join("one", "two"),
        path.join("one", "two", "three")
      );

      expect(result).to.be.true;
    });

    it("should return false in case of a child directory", () => {
      const result = source.internals.isDirSameOrParent(
        path.join("one", "two", "three", "four"),
        path.join("one", "two", "three")
      );

      expect(result).to.be.false;
    });

  });

  describe("pushFilesOnce", () => {

    it("should push the file only once in the given files array", () => {

      const filesArray = [
        { path: path.join("one", "two", "3-one") },
        { path: path.join("one", "two", "3-two") },
        { path: path.join("one", "two", "3-three") },
        { path: path.join("one", "two", "3-four") }
      ];

      source.internals.pushFilesOnce(
        filesArray,
        { path: path.join("one", "two", "3-five") },
        { path: path.join("one", "two", "3-six") },
        { path: path.join("one", "2-two", "one") },
        { path: path.join("one", "2-two", "two") },
        { path: path.join("one", "two", "3-three") }, // duplicate
        { path: path.join("one", "two", "3-four") }   // duplicate
      );

      expect(filesArray).to.deep.equal([
        { path: path.join("one", "two", "3-one") },
        { path: path.join("one", "two", "3-two") },
        { path: path.join("one", "two", "3-three") },
        { path: path.join("one", "two", "3-four") },
        { path: path.join("one", "two", "3-five") },
        { path: path.join("one", "two", "3-six") },
        { path: path.join("one", "2-two", "one") },
        { path: path.join("one", "2-two", "two") }
      ]);

    });
  });

  describe("sortFiles", () => {

    let fileList;

    before(() => {
      const parsedPath = path.parse(sourceDir);

      fileList = [
        {
          root: parsedPath.root,
          dir: sourceDir,
          base: 'fileOne.js',
          ext: '.js',
          name: 'fileOne',
          path: path.join(sourceDir, "fileOne.js"),
          type: 'file'
        },
        {
          root: parsedPath.root,
          dir: sourceDir,
          base: 'fileTwo.js',
          ext: '.js',
          name: 'fileTwo',
          path: path.join(sourceDir, "fileTwo.js"),
          type: 'file'
        },
        {
          root: parsedPath.root,
          dir: sourceDir,
          base: 'folderOne',
          ext: '',
          name: 'folderOne',
          path: path.join(sourceDir, "folderOne"),
          type: 'dir'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderOne"),
          base: 'file1.js',
          ext: '.js',
          name: 'file1',
          path: path.join(sourceDir, "folderOne", "file1.js"),
          type: 'file'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderOne"),
          base: 'file2.js',
          ext: '.js',
          name: 'file2',
          path: path.join(sourceDir, "folderOne", "file2.js"),
          type: 'file'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderOne"),
          base: 'file3.js',
          ext: '.js',
          name: 'file3',
          path: path.join(sourceDir, "folderOne", "file3.js"),
          type: 'file'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderOne"),
          base: 'file4.js',
          ext: '.js',
          name: 'file4',
          path: path.join(sourceDir, "folderOne", "file4.js"),
          type: 'file'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderOne"),
          base: 'Sub3',
          ext: '',
          name: 'Sub3',
          path: path.join(sourceDir, "folderOne", "Sub3"),
          type: 'dir'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderOne", "Sub3"),
          base: '3file1.js',
          ext: '.js',
          name: '3file1',
          path: path.join(sourceDir, "folderOne", "Sub3", "3file1.js"),
          type: 'file'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderOne", "Sub3"),
          base: '3file2.js',
          ext: '.js',
          name: '3file2',
          path: path.join(sourceDir, "folderOne", "Sub3", "3file2.js"),
          type: 'file'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderOne", "Sub3"),
          base: '3file3.js',
          ext: '.js',
          name: '3file3',
          path: path.join(sourceDir, "folderOne", "Sub3", "3file3.js"),
          type: 'file'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderOne", "Sub3"),
          base: '3file4.js',
          ext: '.js',
          name: '3file4',
          path: path.join(sourceDir, "folderOne", "Sub3", "3file4.js"),
          type: 'file'
        },
        {
          root: parsedPath.root,
          dir: sourceDir,
          base: 'folderTwo',
          ext: '',
          name: 'folderTwo',
          path: path.join(sourceDir, "folderTwo"),
          type: 'dir'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderTwo"),
          base: '2file1.js',
          ext: '.js',
          name: '2file1',
          path: path.join(sourceDir, "folderTwo", "2file1.js"),
          type: 'file'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderTwo"),
          base: '2file2.js',
          ext: '.js',
          name: '2file2',
          path: path.join(sourceDir, "folderTwo", "2file2.js"),
          type: 'file'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderTwo"),
          base: '2file3.js',
          ext: '.js',
          name: '2file3',
          path: path.join(sourceDir, "folderTwo", "2file3.js"),
          type: 'file'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderTwo"),
          base: '2file4.js',
          ext: '.js',
          name: '2file4',
          path: path.join(sourceDir, "folderTwo", "2file4.js"),
          type: 'file'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderTwo"),
          base: '2Sub3',
          ext: '',
          name: '2Sub3',
          path: path.join(sourceDir, "folderTwo", "2Sub3"),
          type: 'dir'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderTwo", "2Sub3"),
          base: '3Sub4',
          ext: '',
          name: '3Sub4',
          path: path.join(sourceDir, "folderTwo", "2Sub3", "3Sub4"),
          type: 'dir'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderTwo", "2Sub3", "3Sub4"),
          base: '4file1.js',
          ext: '.js',
          name: '4file1',
          path: path.join(sourceDir, "folderTwo", "2Sub3", "3Sub4", "4file1.js"),
          type: 'file'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderTwo", "2Sub3", "3Sub4"),
          base: '4file2.js',
          ext: '.js',
          name: '4file2',
          path: path.join(sourceDir, "folderTwo", "2Sub3", "3Sub4", "4file2.js"),
          type: 'file'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderTwo", "2Sub3", "3Sub4"),
          base: '4file3.js',
          ext: '.js',
          name: '4file3',
          path: path.join(sourceDir, "folderTwo", "2Sub3", "3Sub4", "4file3.js"),
          type: 'file'
        },
        {
          root: parsedPath.root,
          dir: path.join(sourceDir, "folderTwo", "2Sub3", "3Sub4"),
          base: '4file4.js',
          ext: '.js',
          name: '4file4',
          path: path.join(sourceDir, "folderTwo", "2Sub3", "3Sub4", "4file4.js"),
          type: 'file'
        }
      ];

    });

    it("should sort the source file list with the given order array", () => {

      const orderList = [
        path.join(sourceDir, "folderTwo", "2Sub3", "3Sub4", "4file1.js"),
        path.join(sourceDir, "folderTwo", "2file1.js"),
        path.join(sourceDir, "folderOne", "Sub3", "3file1.js"),
        path.join(sourceDir, "folderOne", "file1.js"),
        path.join(sourceDir, "fileOne.js"),
        path.join(sourceDir, "folderOne"),
        path.join(sourceDir, "folderTwo", "2file4.js"),
        path.join(sourceDir, "folderTwo", "2Sub3", "3Sub4"),
        path.join(sourceDir, "folderTwo")
      ];

      const result = source.internals.sortFiles(fileList, orderList);

      expect(result).not.empty;
      expect(result.length).to.be.equal(18);

      expect(result[0].path).to.equal(path.join(sourceDir, "folderTwo", "2Sub3", "3Sub4", "4file1.js"));
      expect(result[1].path).to.equal(path.join(sourceDir, "folderTwo", "2file1.js"));
      expect(result[2].path).to.equal(path.join(sourceDir, "folderOne", "Sub3", "3file1.js"));
      expect(result[3].path).to.equal(path.join(sourceDir, "folderOne", "file1.js"));
      expect(result[4].path).to.equal(path.join(sourceDir, "fileOne.js"));
      expect(result[5].path).to.equal(path.join(sourceDir, "folderOne", "file2.js"));
      expect(result[6].path).to.equal(path.join(sourceDir, "folderOne", "file3.js"));
      expect(result[7].path).to.equal(path.join(sourceDir, "folderOne", "file4.js"));
      expect(result[8].path).to.equal(path.join(sourceDir, "folderOne", "Sub3", "3file2.js"));
      expect(result[9].path).to.equal(path.join(sourceDir, "folderOne", "Sub3", "3file3.js"));
      expect(result[10].path).to.equal(path.join(sourceDir, "folderOne", "Sub3", "3file4.js"));
      expect(result[11].path).to.equal(path.join(sourceDir, "folderTwo", "2file4.js"));
      expect(result[12].path).to.equal(path.join(sourceDir, "folderTwo", "2Sub3", "3Sub4", "4file2.js"));
      expect(result[13].path).to.equal(path.join(sourceDir, "folderTwo", "2Sub3", "3Sub4", "4file3.js"));
      expect(result[14].path).to.equal(path.join(sourceDir, "folderTwo", "2Sub3", "3Sub4", "4file4.js"));
      expect(result[15].path).to.equal(path.join(sourceDir, "folderTwo", "2file2.js"));
      expect(result[16].path).to.equal(path.join(sourceDir, "folderTwo", "2file3.js"));
      expect(result[17].path).to.equal(path.join(sourceDir, "fileTwo.js"));

    });

    it("should return empty array in case of missing arguments", () => {

      const result = source.internals.sortFiles();

      expect(result).to.deep.equal([]);

    });

    it("should return the correct sort even if the order contains duplicates", () => {

      const orderList = [
        path.join(sourceDir, "folderTwo", "2Sub3", "3Sub4", "4file1.js"),
        path.join(sourceDir, "folderTwo", "2file1.js"),
        path.join(sourceDir, "folderOne", "Sub3", "3file1.js"),
        path.join(sourceDir, "folderOne", "file1.js"),
        path.join(sourceDir, "fileOne.js"),
        path.join(sourceDir, "folderOne"),
        path.join(sourceDir, "folderOne"),
        path.join(sourceDir, "folderTwo", "2file4.js"),
        path.join(sourceDir, "folderTwo", "2file4.js"),
        path.join(sourceDir, "folderTwo", "2Sub3", "3Sub4"),
        path.join(sourceDir, "folderTwo"),
        path.join(sourceDir, "folderTwo"),
        path.join(sourceDir, "folderOne")
      ];

      const result = source.internals.sortFiles(fileList, orderList);

      expect(result).not.empty;
      expect(result.length).to.be.equal(18);

      expect(result[0].path).to.equal(path.join(sourceDir, "folderTwo", "2Sub3", "3Sub4", "4file1.js"));
      expect(result[1].path).to.equal(path.join(sourceDir, "folderTwo", "2file1.js"));
      expect(result[2].path).to.equal(path.join(sourceDir, "folderOne", "Sub3", "3file1.js"));
      expect(result[3].path).to.equal(path.join(sourceDir, "folderOne", "file1.js"));
      expect(result[4].path).to.equal(path.join(sourceDir, "fileOne.js"));
      expect(result[5].path).to.equal(path.join(sourceDir, "folderOne", "file2.js"));
      expect(result[6].path).to.equal(path.join(sourceDir, "folderOne", "file3.js"));
      expect(result[7].path).to.equal(path.join(sourceDir, "folderOne", "file4.js"));
      expect(result[8].path).to.equal(path.join(sourceDir, "folderOne", "Sub3", "3file2.js"));
      expect(result[9].path).to.equal(path.join(sourceDir, "folderOne", "Sub3", "3file3.js"));
      expect(result[10].path).to.equal(path.join(sourceDir, "folderOne", "Sub3", "3file4.js"));
      expect(result[11].path).to.equal(path.join(sourceDir, "folderTwo", "2file4.js"));
      expect(result[12].path).to.equal(path.join(sourceDir, "folderTwo", "2Sub3", "3Sub4", "4file2.js"));
      expect(result[13].path).to.equal(path.join(sourceDir, "folderTwo", "2Sub3", "3Sub4", "4file3.js"));
      expect(result[14].path).to.equal(path.join(sourceDir, "folderTwo", "2Sub3", "3Sub4", "4file4.js"));
      expect(result[15].path).to.equal(path.join(sourceDir, "folderTwo", "2file2.js"));
      expect(result[16].path).to.equal(path.join(sourceDir, "folderTwo", "2file3.js"));
      expect(result[17].path).to.equal(path.join(sourceDir, "fileTwo.js"));

    });

    it("should reject with a proper error if the order contains file that doesn't exist on disk", () => {

      expect(() => { source.internals.sortFiles(fileList, [path.join(sourceDir, "test.js")]) }).to.throw();

    });

  });

  describe("setRelativePath", () => {
    it("should set Relative path on file info object", () => {
      const data = [
        {
          dir: path.join(sourceDir, "folderOne"),
          name: "fileOne"
        },
        {
          dir: path.join(sourceDir, "folderOne"),
          name: "fileTwo"
        },
        {
          dir: path.join(sourceDir, "folderTwo", "folderThree"),
          name: "fileOne"
        },
        {
          dir: path.join(sourceDir, "folderTwo", "folderThree"),
          name: "fileTwo"
        }
      ];

      source.internals.setRelativePath(data, sourceDir);

      expect(data[0].relativePath).to.deep.equal(path.join("folderOne", "fileOne"));
      expect(data[1].relativePath).to.deep.equal(path.join("folderOne", "fileTwo"));
      expect(data[2].relativePath).to.deep.equal(path.join("folderTwo", "folderThree", "fileOne"));
      expect(data[3].relativePath).to.deep.equal(path.join("folderTwo", "folderThree", "fileTwo"));
    });
  });

  describe("getFilesInfo", async () => {

    let modulesDir, orderPath;

    before(async () => {
      await fs.mkdirAsync(sourceDir);

      // get paths
      modulesDir = path.join(sourceDir, "api");
      orderPath = path.join(sourceDir, "order.json");

      // write files
      await Promise.all([
        fs.writeFileAsync(orderPath, `[
          "api/folderTwo",
          "api/fileOne.js",
          "api/folderOne",
          "api/fileThree.js"
        ]`),
        fs.mkdirAsync(modulesDir)
      ]);

      await Promise.all([
        fs.writeFileAsync(path.join(modulesDir, "fileOne.js"), ""),
        fs.writeFileAsync(path.join(modulesDir, "fileTwo.js"), ""),
        fs.writeFileAsync(path.join(modulesDir, "fileThree.js"), ""),
        fs.mkdirAsync(path.join(modulesDir, "folderOne")),
        fs.mkdirAsync(path.join(modulesDir, "folderTwo"))
      ]);

      await Promise.all([
        fs.writeFileAsync(path.join(modulesDir, "folderOne", "fileOne.js"), ""),
        fs.writeFileAsync(path.join(modulesDir, "folderOne", "fileTwo.js"), ""),
        fs.writeFileAsync(path.join(modulesDir, "folderTwo", "fileOne.js"), ""),
        fs.writeFileAsync(path.join(modulesDir, "folderTwo", "fileTwo.js"), "")
      ]);

    });

    after(async () => {
      await fs.removeDirAsync(sourceDir);
    });

    it("e2e", async () => {
      const fileList = await source.getFilesInfo(modulesDir, orderPath);

      expect(fileList).to.not.be.empty;
      expect(fileList.length).to.equal(7);

      expect(fileList[0].path).to.equal(path.join(modulesDir, "folderTwo", "fileOne.js"));
      expect(fileList[1].path).to.equal(path.join(modulesDir, "folderTwo", "fileTwo.js"));
      expect(fileList[2].path).to.equal(path.join(modulesDir, "fileOne.js"));
      expect(fileList[3].path).to.equal(path.join(modulesDir, "folderOne", "fileOne.js"));
      expect(fileList[4].path).to.equal(path.join(modulesDir, "folderOne", "fileTwo.js"));
      expect(fileList[5].path).to.equal(path.join(modulesDir, "fileThree.js"));
      expect(fileList[6].path).to.equal(path.join(modulesDir, "fileTwo.js"));
    });

    it("should return empty array in case of the source directory not exist", async () => {
      const result = await source.getFilesInfo(path.join(sourceDir, "notFound"), orderPath);
      expect(result).to.deep.equal([]);
    });

    it("should not terminate if the provided ( order.json ) does not exist", async () => {
      const result = source.getFilesInfo(modulesDir, path.join(sourceDir, "notFound.json"));
      await expect(result).to.be.fulfilled;
    });

    it("should print warning in case of missing ( order.json )", async () => {
      sinon.spy(logger, "warn");

      await source.getFilesInfo(modulesDir, path.join(sourceDir, "notFound.json"));

      expect(logger.warn.calledOnce).to.be.true;

      logger.warn.restore();
    });

    it("should print warning in case of missing source directory", async () => {
      sinon.spy(logger, "warn");

      try {
        await source.getFilesInfo(path.join(sourceDir, "notFound"), orderPath);
      }
      catch (e) {}

      expect(logger.warn.calledOnce).to.be.true;

      logger.warn.restore();
    });

    it("should terminate if the provided source directory is not a valid directory", async () => {
      const fileAsSrcDir = path.join(sourceDir, "file.js");

      await fs.writeFileAsync(fileAsSrcDir, "");

      const result = source.getFilesInfo(fileAsSrcDir, orderPath);

      await expect(result).to.be.rejected;
    });

  });

});