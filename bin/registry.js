"use strict";

const path = require("path");
const _ = require("lodash");
const fs = require("../utils/fs");
const { checkbox, list } = require("../utils/cli");
const {
  getPackages,
  getPackageInfo,
  populatePackage,
  resolveVersion,
  semver
} = require("../lib/registry");
const { filterByAttr, asyncMap } = require("../utils/obj");
const downloader = require("../lib/downloader");
const decompress = require("decompress");
const npmHandler = require("../lib/npm");
const obj = require("../utils/obj");

let logger = {
  info: console.log,
  error: console.log,
  warn: console.log
};

let config = {
  keyword: "nodearch-packages",
  location: process.cwd(),
  app: process.cwd()
};

const installed = {};

async function selectPackages(pkgsNames = []) {
  // if no packages provided, then get packages,
  // from registry and let the user select them.
  if (_.isEmpty(pkgsNames)) {
    const pkgs = await getPackages(config.keyword);
    pkgsNames = _.map(pkgs, "name");

    if (_.isEmpty(pkgsNames)) {
      return logger.error("no packages found!");
    }

    pkgsNames = await checkbox({
      message: "choose from the available packages",
      list: pkgsNames
    });
  }

  const pkgs = formatPkgs(pkgsNames);

  return pkgs;
}

async function populatePkgsInfo(pkgs) {
  return await asyncMap(pkgs, populatePackage);
}

async function selectVersions(packages = []) {
  for (const pkg of packages) {
    if (pkg.selectedVersion) {
      const resolvedVersion = resolveVersion(
        pkg.selectedVersion,
        _.map(pkg.versions, "version")
      );

      if (resolvedVersion && resolvedVersion !== pkg.selectedVersion) {
        logger.warn(
          `version ${pkg.selectedVersion} of the package ${
            pkg.name
          } resolved to ${resolvedVersion}`
        );
      }

      if (!resolvedVersion) {
        logger.error(
          `package ${pkg.name} doesn\'t have version ${pkg.selectedVersion}`
        );
        pkg.selectedVersion = null;
      } else {
        const selectedVerInfo = pkg.versions[resolvedVersion];
        pkg.selectedVersion = pickVersionInfo(selectedVerInfo);
      }
    }

    if (!pkg.selectedVersion) {
      const version = await list({
        message: `choose from the available versions for the package ${
          pkg.name
        }`,
        list: _
          .map(pkg.versions, "version")
          .sort(semver)
          .reverse()
      });

      const versionInfo = pkg.versions[version];

      pkg.selectedVersion = pickVersionInfo(versionInfo);
    }
  }

  return packages;
}

async function downloadPkg(name, link, location) {
  const data = await downloader(link);

  return decompress(data, location, {
    filter: file => _.includes([".js", ".json"], path.extname(file.path)),
    strip: 1,
    map: file => {
      file.path = path.join(name, file.path);
      return file;
    }
  });
}

async function installDeps(downloaded) {
  let pkgsInfo = _.find(
    downloaded,
    x => path.basename(x.path) === "package.json"
  );

  if (!pkgsInfo) return;

  try {
    pkgsInfo = JSON.parse(pkgsInfo.data.toString());
  } catch (e) {
    logger.error("cannot parse the downloaded package.json");
  }

  if (!pkgsInfo || _.isEmpty(pkgsInfo.dependencies)) return;

  const pkgsToInstall = _.map(pkgsInfo.dependencies, (value, key) => {
    return {
      name: key,
      version: value
    };
  });

  const existingDeps = await npmHandler.npmDeps(config.app);

  const { filtered, exist } = npmHandler.compareDeps(
    existingDeps,
    pkgsToInstall
  );

  if (!_.isEmpty(exist)) {
    let msg = `the following packages were requested, but you already have them installed:`;
    _.forEach(exist, x => {
      msg += `\npackage\t[ ${x.pkg} ]\texist with the tag\t[ ${
        x.existTag
      } ]\trequested\t${x.requestedTag}`;
      if (x.existTag === x.requestedTag) {
        msg += `\t\tResolved!`;
      }
    });
    logger.warn(msg);
  }

  if (!_.isEmpty(filtered)) {
    await npmHandler.npmInstall(filtered, config.app);
  }
}

function formatPkgs(pkgsNames) {
  return _.map(pkgsNames, pkgName => {
    const parts = pkgName.split("@");
    return {
      name: parts[0],
      selectedVersion: parts[1]
    };
  });
}

function pickVersionInfo(verInfo) {
  return {
    version: verInfo.version,
    tarball: verInfo.dist.tarball,
    shasum: verInfo.dist.shasum
  };
}

async function installPackages(pkgs = []) {
  let selectedPkgs = await selectPackages(pkgs);

  selectedPkgs = await populatePkgsInfo(selectedPkgs);

  selectedPkgs = await selectVersions(selectedPkgs);

  for (const pkg of selectedPkgs) {
    const downloaded = await downloadPkg(
      pkg.name,
      pkg.selectedVersion.tarball,
      config.location
    );
    await installDeps(downloaded);
  }
}

async function getInstalledPackages() {
  const { folders: packages, files: legacy } = await fs.dirContent(config.location);
  return { packages, legacy };
}

async function removePackages(pkgs) {
  if (_.isEmpty(pkgs)) {
    const legacy = _.map(installed.legacy, x => path.basename(x, '.js'));

    pkgs = await checkbox({
      message: "choose from installed packages",
      list: _.union(installed.packages, legacy)
    });
  }

  if (_.isEmpty(pkgs)) return;

  return obj.asyncMap(pkgs, (pkg) => {
    let found = _.find(installed.packages, _.matches(pkg));
    found = found ? found : _.find(installed.legacy, _.matches(`${pkg}.js`));

    if (!found) {
      logger.warn(`request to remove package ${pkg} :: package not found!`);
      return true;
    }
    else {
      found = path.join(config.location, found);
      return fs.remove(found);
    }
  });
}

async function init(options) {
  config = options.config || config;
  logger = options.logger || logger;

  const result = await getInstalledPackages();

  installed.packages = result.packages;
  installed.legacy = result.legacy;

  return {
    installPackages,
    removePackages
  };
}

module.exports = init;
