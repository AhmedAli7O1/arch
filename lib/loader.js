'use strict';

const structure = require('./structure');
const memory = require('./memory');
const fs = require('../utils/fs');
const path = require('path');
const _ = require('lodash');
const extension = require('./extension');
const paths = require('../text/paths.json');


function constructMemoryAddress(...attrs) {
  return _.join(attrs, '.');
}

async function loadSchemaItem(baseLocation, schemaItem, memory, memoryAddress) {
  if (!schemaItem) return;

  const elementName = fs.fileName(schemaItem.name);
  const constructedMemAdd = constructMemoryAddress(memoryAddress, elementName);
  const itemLocation = path.resolve(baseLocation, schemaItem.name);

  if (schemaItem.type === 'module' || !schemaItem.type) {
    _.set(memory, constructedMemAdd, require(itemLocation));
  }
  else if (schemaItem.type === 'component') {

    for (const x of schemaItem.modules) {
      await loadSchemaItem(itemLocation, x, memory, constructedMemAdd)
    }
    await extension.exec('component', _.get(memory, constructedMemAdd), elementName);
  }
  else {
    throw new Error('schema item type ${element.type} is not supported, use module/component only');
  }
}

async function loadPlugin(structureLocation, loaderSchema, memory, memoryAddress) {
  for (const schemaItem of loaderSchema) {
    if (!schemaItem.disable) {
      await loadSchemaItem(structureLocation, schemaItem, memory, memoryAddress);
    }
  }
}

function handleNotFound(notFoundPlugins, pluginsSchema) {

  const notFoundComponents = _(pluginsSchema)
    .map('notFound')
    .flatten()
    .value();

  const notFound = _.union(notFoundPlugins, notFoundComponents)

  if (!_.isEmpty(notFound)) {

    const err = new Error(
      `structure validator
      the following was provided in the app specification but not found on disk
      \t${_.join(notFound, '\n\t')}`
    );
    err.noStack = true;
    throw err;
  }

}

async function loadPlugins(pluginslocation, memory = {}, memoryAddress) {
  try {
    const content = await fs.dirContent(pluginslocation);

    let pluginsSpec = _.find(content.files, _.matches(paths.spec));

    if (pluginsSpec) {
      pluginsSpec = path.resolve(pluginslocation, pluginsSpec);
    }

    let {
      mergedSpecs: pluginsSchema, notFound: notFoundPlugins
    } = await structure.getPluginsLoaderSchema(pluginslocation, pluginsSpec);

    for (const pluginInfo of pluginsSchema) {
      const pluginPath = path.resolve(pluginslocation, pluginInfo.name);
      const pluginsSpecPath = path.resolve(pluginPath, paths.spec);

      const {
        mergedSpecs: componentsSchema, notFound
      } = await structure.getComponentsLoaderSchema(pluginPath, pluginsSpecPath);

      const pluginsMemAddr = memoryAddress ? constructMemoryAddress(memoryAddress, pluginInfo.name) : pluginInfo.name;

      pluginInfo.notFound = notFound;
      pluginInfo.path = pluginPath;
      pluginInfo.schema = componentsSchema;
      pluginInfo.memoryAddress = pluginsMemAddr;

    }

    handleNotFound(notFoundPlugins, pluginsSchema);

    for (const pluginInfo of pluginsSchema) {
      await loadPlugin(pluginInfo.path, pluginInfo.schema, memory, pluginInfo.memoryAddress);
    }

    return memory;
  }
  catch (e) {
    throw e;
  }
}


module.exports = {
  loadPlugin,
  loadPlugins
};