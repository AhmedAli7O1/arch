"use strict";

const RegistryClient = require("npm-registry-client");
const _ = require("lodash");
const client = new RegistryClient();

function get(uri) {
  return new Promise((resolve, reject) => {
    client.get(uri, { timeout: 1000 }, function(error, data, raw, res) {
      if (error) return reject(error);
      resolve(data);
    });
  });
}

async function getPackages(keyword) {
  const result = await get(
    `http://registry.npmjs.org/-/v1/search?text=keywords:${keyword}`
  );
  return _.map(result.objects, "package") || [];
}

async function getPackageInfo(packageName) {
  return get(`http://registry.npmjs.org/${packageName}`);
}

async function populatePackage(pkg) {
  const packageInfo = await getPackageInfo(pkg.name);
  pkg.versions = packageInfo.versions;
  return pkg;
}


function semver (a, b) {
  const pa = a.split('.');
  const pb = b.split('.');
  for (let i = 0; i < 3; i++) {
      const na = Number(pa[i]);
      const nb = Number(pb[i]);
      if (na > nb) return 1;
      if (nb > na) return -1;
      if (!isNaN(na) && isNaN(nb)) return 1;
      if (isNaN(na) && !isNaN(nb)) return -1;
  }
  return 0;
}


function resolveVersion(version, versions) {
  if (!version || !versions) return;

  const parts = version.split(".") || [];
  let regx;

  switch (parts.length) {
    case 1:
      regx = new RegExp(`${parts[0]}.[0-9].[0-9]`, "g");
      break;
    case 2:
      regx = new RegExp(`${parts[0]}.${parts[1]}.[0-9]`, "g");
      break;
    case 3:
      regx = version;
      break;
    default:
      throw new Error(`invalid version number ${version}`);
  }

  return _.find(versions.sort(semver).reverse(), x => x.match(regx));
}



module.exports = {
  getPackages,
  getPackageInfo,
  populatePackage,
  semver,
  resolveVersion
};
