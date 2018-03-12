'use strict';

const structure = require('./structure');
const memory = require('./memory');
const fs = require('../utils/fs');
const path = require('path');
const _ = require('lodash');


function constructMemoryAddress (...attrs) {
  return _.join(attrs, '.');
}

function loadSchemaItem (baseLocation, schemaItem, memory, memoryAddress) {
  if (!schemaItem) return;

  const elementName = fs.fileName(schemaItem.name);
  const constructedMemAdd = constructMemoryAddress(memoryAddress, elementName);
  const itemLocation = path.resolve(baseLocation, schemaItem.name);

  if (schemaItem.type === 'module' || !schemaItem.type) {
    _.set(memory, constructedMemAdd, require(itemLocation));
  }
  else if (schemaItem.type === 'component') {
    _.forEach(schemaItem.modules, x => loadSchemaItem(itemLocation, x, memory, constructedMemAdd));
  }
  else {
    throw new Error('schema item type ${element.type} is not supported, use module/component only');
  }
}

async function loadPlugin(structureLocation, specLocation, memory, memoryAddress) {
  const loaderSchema = await structure.getLoaderSchema(structureLocation, specLocation);
  _.forEach(loaderSchema, schemaItem => {    
    loadSchemaItem(structureLocation, schemaItem, memory, memoryAddress);
  });
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