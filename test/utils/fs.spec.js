'use strict';

const fsTest = require('../../utils/fs');
const fse = require('fs-extra');
const path = require('path');
const chai = require('chai');
const _ = require('lodash');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const { expect } = chai;

describe('utils/fs', function () {
  describe('#formatFileArray()', () => {
    it('should return formatted files array', () => {
      const data = [
        '/home/ubuntu/user/myProject/api/file1.js',
        '/home/ubuntu/user/myProject/api/file2.json',
        '/home/ubuntu/user/myProject/api/file3.txt',
        '/home/ubuntu/user/myProject/api/file4'
      ];
      const result = fsTest.formatFileArray(data);

      expect(_.isArray(result), 'is array').to.equal(true);
      expect(result.length, `contains ${data.length} elements`).to.equal(
        data.length
      );
      expect(result[0]).to.deep.equal({
        name: 'file1',
        path: data[0],
        extension: 'js'
      });
      expect(result[1]).to.deep.equal({
        name: 'file2',
        path: data[1],
        extension: 'json'
      });
      expect(result[2]).to.deep.equal({
        name: 'file3',
        path: data[2],
        extension: 'txt'
      });
      expect(result[3]).to.deep.equal({
        name: 'file4',
        path: data[3],
        extension: ''
      });
    });
  });

  describe('#loadModules()', () => {
    const temp = path.resolve('./temp');

    const data = [`${temp}/file1.js`, `${temp}/file2.json`];

    const fileOneContent = 'fileOne content';
    const fileTwoContent = 'fileTwo content';

    before(async () => {
      await fse.outputFile(
        data[0],
        `module.exports.content = '${fileOneContent}';`
      );
      await fse.outputFile(data[1], `{"content": "${fileTwoContent}"}`);
    });

    it('should load one module', async () => {
      const result = await fsTest.loadModules(data[0]);

      expect(result).to.deep.equal({
        path: data[0],
        data: { content: fileOneContent }
      });

    });

    it('should load one module and format the returned info', async () => {
      const result = await fsTest.loadModules(data[0], true);

      expect(result).to.deep.equal({
        path: data[0],
        extension: 'js',
        name: 'file1',
        data: { content: fileOneContent }
      });

    });

    it('should load modules', async () => {
      const result = await fsTest.loadModules(data);

      expect(result).to.deep.equal([
        {
          path: data[0],
          data: { content: fileOneContent }
        },
        {
          path: data[1],
          data: { content: fileTwoContent }
        }
      ]);
    });

    it('should load modules and format the returned info', async () => {
      const result = await fsTest.loadModules(data, true);

      expect(result).to.deep.equal([
        {
          path: data[0],
          extension: 'js',
          name: 'file1',
          data: { content: fileOneContent }
        },
        {
          path: data[1],
          extension: 'json',
          name: 'file2',
          data: { content: fileTwoContent }
        }
      ]);
    });

    after(async () => {
      await fse.remove(temp);
    });
  });

  describe('#dirContent()', () => {
    const temp = path.resolve('./temp');

    const data = [
      `${temp}/file1.js`,
      `${temp}/file2.js`,
      `${temp}/folder1`,
      `${temp}/folder2`
    ];

    before(async () => {
      await Promise.all([
        fse.ensureFile(data[0]),
        fse.ensureFile(data[1]),
        fse.ensureDir(data[2]),
        fse.ensureDir(data[3])
      ]);
    });

    it('should get the folder content', async () => {
      const result = await fsTest.dirContent(path.resolve(temp));

      expect(result).to.deep.equal({
        folders: ['folder1', 'folder2'],
        files: ['file1.js', 'file2.js']
      });
    });

    after(async () => {
      await fse.remove(temp);
    });
  });

  describe('#resolvePaths()', () => {
    const data = ['project/test1', 'projects/test2'];

    it('should resolve all paths', () => {
      const result = fsTest.resolvePaths(data, '/home');

      expect(result).to.deep.equal([
        '/home/project/test1',
        '/home/projects/test2'
      ]);
    });

    it('should resolve all paths with a handler', () => {
      const result = [];

      fsTest.resolvePaths(data, '/home', (resolvedPath) =>
        result.push(resolvedPath)
      );

      expect(result).to.deep.equal([
        '/home/project/test1',
        '/home/projects/test2'
      ]);
    });
  });

  describe('#canRead()', () => {
    const temp = path.resolve('./temp');
    const data = [`${temp}/file1.js`];

    before(async () => {
      await fse.ensureFile(data[0]);
    });

    it('should return true for existing file', async () => {
      await expect(fsTest.canRead(data[0])).to.eventually.equal(true);
    });

    it('should return true for existing directory', async () => {
      await expect(fsTest.canRead(path.resolve(temp))).to.eventually.equal(
        true
      );
    });

    it('should return false for non-existing file', async () => {
      await expect(
        fsTest.canRead(path.resolve(temp, 'test.js'))
      ).to.eventually.equal(false);
    });

    after(async () => {
      await fse.remove(temp);
    });
  });

  describe('#fileName()', () => {

    it('should return the file name from a full file path', () => {
      expect(fsTest.fileName('/home/projects/arcjs/testFile.js')).to.equal('testFile');
    });

  });

});
