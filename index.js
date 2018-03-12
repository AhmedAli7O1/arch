"use strict";

const path = require("path");
const _ = require("lodash");
const specification = require('./lib/specification');

const inputData = require("./testData/loader/input.json");

const arr = [];

function getModulePath(componentName, moduleName) {
  return `${componentName}.${moduleName}`;
}

const onDiskComponents = _.filter(inputData.onDisk, { type: "component" });
const onDiskModules = _.filter(inputData.onDisk, { type: "module" });

const specComponents = _.filter(inputData.spec, { type: "component" });
const specModules = _.filter(inputData.spec, { type: "module" });

const specs = [];

//console.log(JSON.stringify(inputData.onDisk, null, 2));


function mergeSpec (specs, onDisk) {
  return _(specs)
  .map(spec => {
    
    if (!_.isEmpty(spec.modules)) {
      const onDiskSpec = _.find(onDisk, { name: spec.name });

      if (onDiskSpec) {
        spec.modules = _.unionBy(spec.modules, onDiskSpec.modules, 'name');
      }
    }

    return sp;

  })
  .unionBy(onDisk, 'name')
  .value();
}

//console.log(JSON.stringify(result, null, 2));


//const ee = _.unionBy(inputData.spec, inputData.onDisk, 'name');

console.log(JSON.stringify(result, null, 2));





/*
_.forEach(components, i => {
  if (i.modules) {
    _.forEach(i.modules, m => {
      arr.push(getModulePath(i.name, m.name));
    });
  } else {
    arr.push(i.name);
  }
});
*/
// console.log(arr);




