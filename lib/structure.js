"use strict";

const _ = require("lodash");
const fs = require("../utils/fs");
const path = require("path");
const specification = require('./specification');
const config = require('../config.json');
const bluebirdPromise = require("bluebird").Promise;

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

async function getPluginsOndisk (structurePath) {
  try {
    const onDisk = await fs.readdir(structurePath);

    return _(onDisk)
      .filter(pluginName => !path.extname(pluginName))
      .map(pluginName => ({ name: pluginName })).value();
  }
  catch (e) {
    return [];
  }
}

async function getComponentsOnDisk(structurePath) {
  try {
    const onDisk = await fs.readdir(structurePath); 
    const componentsNames = _.filter(onDisk, x => !path.extname(x));
    const modulesNames = _.filter(onDisk, x => path.extname(x));
    
    _.remove(modulesNames, x => _.includes(config.loaderExclude, x));
  
    const modules = _.map(modulesNames, moduleName => ({
      "name": moduleName,
      "type": "module"
    }));
  
    const components = await bluebirdPromise.map(componentsNames, componentName => {
      return loadComponent(componentName, path.join(structurePath, componentName));
    });
  
    return _.union(components, modules);
  }
  catch (e) {
    return [];
  }
}

async function getSpec(specLocation) {
  return fs.readJSON(specLocation);
}

async function getStructureInfo(structurePath, specLocation, diskFinder) {
  const onDisk = await diskFinder(structurePath);

  const spec = _.uniqBy(specLocation ? await getSpec(specLocation) : [], 'name');

  let notFound = _.difference(_.map(spec, 'name'), _.map(onDisk, 'name'));
  notFound = fs.resolvePaths(notFound, structurePath)

  _.forEach(_.filter(spec, sp => !_.isEmpty(sp.modules)), sp => {
    const specModules = _.map(sp.modules, 'name');
    const onDiskModules = _.map(_.get(_.find(onDisk, { name: sp.name }), 'modules'), 'name');
    let diff = _.difference(specModules, onDiskModules);
    diff = fs.resolvePaths(diff, path.resolve(structurePath, sp.name));
    notFound = _.union(notFound, diff);
  });

  return {
    onDisk,
    spec,
    notFound
  };
}

async function getComponentsLoaderSchema(structurePath, specLocation) {
  const { onDisk, spec, notFound } = await getStructureInfo(structurePath, specLocation, getComponentsOnDisk);

  if (!_.isEmpty(notFound)) {
    return { mergedSpecs: [], notFound };
  }

  // it will throw an error if schema is not valid 
  await specification.validateComponentsSpec(spec);

  const mergedSpecs = await specification.mergeComponentsSpec(spec, onDisk);  

  return { mergedSpecs, notFound };

}

async function getPluginsLoaderSchema (structurePath, specLocation) {
  const { onDisk, spec, notFound } = await getStructureInfo(structurePath, specLocation, getPluginsOndisk);

  if (!_.isEmpty(notFound)) {
    return { mergedSpecs: [], notFound };
  }

  // it will throw an error if schema is not valid
  await specification.validatePluginsSpec(spec);

  const mergedSpecs = await specification.mergePluginsSpec(spec, onDisk);  

  return { mergedSpecs, notFound };

}

const internals = {
  loadComponent,
  getPluginsOndisk,
  getComponentsOnDisk,
  getStructureInfo,
  getComponentsLoaderSchema,
  getPluginsLoaderSchema
};

module.exports = {
  getStructureInfo,
  getComponentsLoaderSchema,
  getPluginsLoaderSchema,
  _internals: internals
};