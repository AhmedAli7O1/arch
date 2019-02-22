'use strict';

const fs = require("./fs");
const path = require("path");
const { mapAsync, execPromise } = require("./promise");
const config = require("../config");
const logger = require("./logger");

async function getDirContent (dir) {
  let dirContent = await fs.readdirAsync(dir);

  dirContent = await mapAsync(dirContent, async (item) => {
    const itemPath = path.join(dir, item);

    let itemInfo = path.parse(itemPath);
    itemInfo.path = itemPath;

    const stat = await fs.lstatAsync(itemPath);
    if (stat.isDirectory()) {
      itemInfo.type = "dir";
    }
    else if (stat.isFile() && config.supportedFileTypes.includes(itemInfo.ext)) {
      itemInfo.type = "file";
    }
    else {
      itemInfo = null;
    }

    return itemInfo;
  });

  // filter null items
  return dirContent.filter((item) => {
    return item;
  });
}

async function getSourceContent (dir) {
  let content = [];

  try {
    const mainDirContent = await getDirContent(dir);

    content = content.concat(
      ...await mapAsync(mainDirContent, async (item) => {
        if (item.type === "dir") {
          return [item, ...await getSourceContent(item.path)];
        }
        else {
          return [item];
        }
      })
    );

    return content;
  }
  catch (e) {
    throw new Error(`couldn't read the source files info @ ${dir}`);
  }

}

async function getOrder (location) {
  let buff, parsedJson, order = [];
  const { dir } = path.parse(location);

  try {
    buff = await fs.readFileAsync(location);
  }
  catch (e) {
    logger.warn("no ( order.json ) file exist, no ordering will be maintained!");
    return [];
  }

  const content = buff.toString();

  if (content) {
    try {
      parsedJson = JSON.parse(content);
    }
    catch (e) {
      throw new Error("couldn't parse ( order.json ), invalid json!");
    }

    if (!parsedJson || !parsedJson.hasOwnProperty("length")) {
      throw new Error("invalid ( order.json ) content expected to find an array of strings");
    }

    if (parsedJson.length) {
      for (let i = 0; i < parsedJson.length; i++) {
        order[i] = path.join(dir, parsedJson[i]);
      }
    }
    else {
      logger.warn("provided ( order.json ) contains an empty array!");
    }
  }
  else {
    logger.warn("provided ( order.json ) is empty!");
  }

  return order;
}

function isDirSameOrParent (dir1, dir2) {
  const dir1Parts = dir1.split(path.sep);
  const dir2Parts = dir2.split(path.sep);

  if (dir1Parts.length > dir2Parts.length) return false;

  let match = true;

  for (let i = 0; i < dir1Parts.length; i++) {
    if (dir1Parts[i] !== dir2Parts[i]) {
      match = false;
      break;
    }
  }

  return match;
}

function pushFilesOnce (fileList, ...files) {
  for (let i = 0; i < files.length; i++) {
    if (!fileList.find(x => x.path === files[i].path)) {
      fileList.push(files[i]);
    }
  }
}

function sortFiles (src = [], order = []) {
  let list = [];

  // resolve paths
  for (let i = 0; i < order.length; i++) {
    const srcItem = src.find((item) => {
      return item.path === order[i];
    });

    if (!srcItem) {
      const msg = `your order configurations does not match the files on disk, ${order[i]} is not exist!`;
      throw new Error(msg);
    }

    if (srcItem.type === "dir") {
      pushFilesOnce(list, ...src.filter(x => {
        return x.type === "file" && isDirSameOrParent(srcItem.path, x.dir);
      }));
    }
    else {
      pushFilesOnce(list, srcItem);
    }
  }

  for (let i = 0; i < src.length; i++) {
    if (src[i].type === "file") {
      pushFilesOnce(list, src[i]);
    }
  }

  return list;
}

function setRelativePath (filesInfo, modulesDir) {
  for (let i = 0; i < filesInfo.length; i++) {
    const relDirPath = filesInfo[i].dir.replace(modulesDir, "");
    filesInfo[i].relativePath = path.join(relDirPath, filesInfo[i].name).replace(path.sep, "");
  }
}

async function getFilesInfo (modulesDir, orderPath) {

  let filesInfoList = [];

  // check if the source directory is exist or not
  let modulesDirStat;

  try {
    modulesDirStat = await fs.lstatAsync(modulesDir);
  }
  catch (e) {
    logger.warn("source directory not found!");
  }

  if (modulesDirStat) {
    if (modulesDirStat.isDirectory()) {
      const order = await getOrder(orderPath);
      const content = await getSourceContent(modulesDir);

      filesInfoList = sortFiles(content, order);

      setRelativePath(filesInfoList, modulesDir);
    }
    else {
      throw new Error("the source directory path does not contains a valid directory!");
    }
  }

  return filesInfoList;
}


module.exports = {
  internals: {
    getDirContent,
    getSourceContent,
    getOrder,
    isDirSameOrParent,
    pushFilesOnce,
    sortFiles,
    setRelativePath
  },
  getFilesInfo
};
