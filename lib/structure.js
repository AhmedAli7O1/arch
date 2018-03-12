"use strict";

const _ = require("lodash");
const fs = require("fs-extra");
const path = require("path");
const specification = require('./specification');
const config = require('../config.json');
Promise = require("bluebird").Promise;

async function loadComponent(componentName, componentPath) {
  let componentModules = await fs.readdir(componentPath);

  componentModules = _.map(componentModules, componentModule => {
    return {
      name: componentModule
    };
  });

  return {
    name: componentName,
    type: "component",
    modules: componentModules
  };
}

async function getOnDisk(structurePath) {
  const onDisk = await fs.readdir(structurePath); 
  const componentsNames = _.filter(onDisk, x => !path.extname(x));
  const modulesNames = _.filter(onDisk, x => path.extname(x));
  
  _.remove(modulesNames, x => _.includes(config.loaderExclude, x));

  const modules = _.map(modulesNames, moduleName => ({
    "name": moduleName,
    "type": "module"
  }));

  const components = await Promise.map(componentsNames, componentName => {
    return loadComponent(componentName, path.join(structurePath, componentName));
  });

  return _.union(components, modules);
}

async function getSpec(specLocation) {
  return fs.readJSON(specLocation);
}

async function getStructureInfo(structurePath, specLocation) {
  const onDisk = await getOnDisk(structurePath);
  const spec = await getSpec(specLocation);

  return {
    onDisk,
    spec
  };
}

async function getLoaderSchema(structurePath, specLocation) {

  const { onDisk, spec } = await getStructureInfo(structurePath, specLocation);

  // it will throw an error if schema is not valid 
  await specification.validateSchema(spec);

  const mergedSpecs = await specification.mergeSpec(spec, onDisk);  

  return mergedSpecs;

}

module.exports = {
  getStructureInfo,
  getLoaderSchema
};