'use strict';

const fs = require("fs");
const util = require("util");
const path = require("path");

fs.readdirAsync = util.promisify(fs.readdir);
fs.readFileAsync = util.promisify(fs.readFile);
fs.lstatAsync = util.promisify(fs.lstat);
fs.rmdirAsync = util.promisify(fs.rmdir);
fs.mkdtempAsync = util.promisify(fs.mkdtemp);
fs.mkdirAsync = util.promisify(fs.mkdir);
fs.writeFileAsync = util.promisify(fs.writeFile);
fs.unlinkAsync = util.promisify(fs.unlink);
fs.removeDirAsync = removeDirAsync;


async function removeDirAsync (dir) {
  const content = await fs.readdirAsync(dir);

  await Promise.all(content.map(async item => {
    const fullPath = path.join(dir, item);
    const stat = await fs.lstatAsync(fullPath);

    if (stat.isDirectory()) {
      await removeDirAsync(fullPath);
    }
    else {
      await fs.unlinkAsync(fullPath);
    }
  }));

  await fs.rmdirAsync(dir);
}

module.exports = fs;
