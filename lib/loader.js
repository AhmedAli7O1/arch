'use strict';

const structure = require('./structure');
const memory = require('./memory');
const fs = require('../utils/fs');
const path = require('path');
const _ = require('lodash');
const extension = require('./extension');


function constructMemoryAddress (...attrs) {
  return _.join(attrs, '.');
}

async function loadSchemaItem (baseLocation, schemaItem, memory, memoryAddress) {
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
    await extension.exec('component', { component: _.get(memory, constructedMemAdd), componentName: elementName });
  }
  else {
    throw new Error('schema item type ${element.type} is not supported, use module/component only');
  }
}

async function loadPlugin(structureLocation, specLocation, memory, memoryAddress) {
  const loaderSchema = await structure.getLoaderSchema(structureLocation, specLocation);
  
  for (const schemaItem of loaderSchema) {
    if (!schemaItem.disable) {
      await loadSchemaItem(structureLocation, schemaItem, memory, memoryAddress);
    }
  }

}

async function loadPlugins (pluginslocation, memory = {}, memoryAddress) {
  try {
    const content = await fs.dirContent(pluginslocation);

    const pluginsLocations = fs.resolvePaths(content.folders, pluginslocation);
  
    const formattedPluginsArray = fs.formatFileArray(pluginsLocations);
  
    // TODO: if specs.json not found, print warn msg
  
    for (const pluginInfo of formattedPluginsArray) {
      const pluginsMemAddr = memoryAddress ? constructMemoryAddress(memoryAddress, pluginInfo.name) : pluginInfo.name;
      await loadPlugin(pluginInfo.path, path.resolve(pluginInfo.path, 'specification.json'), memory, pluginsMemAddr); 
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