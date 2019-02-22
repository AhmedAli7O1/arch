"use strict";


function set (obj, dottedPath, value) {
  const pathParts = handleObjectPath(dottedPath);
  const lastPathPart = pathParts[pathParts.length - 1];
  
  let objRef = obj;
  
  // loop over path parts except the last part to ensure the path is exist
  for (let i = 0; i < pathParts.length - 1; i++) {
    const pathPart = pathParts[i];

    // if path doesn't exist create it 
    if (!objRef[pathPart]) {
      objRef[pathPart] = {};
    }
    
    // change the reference to the nested object 
    objRef = objRef[pathPart];
  }

  assignValue(objRef, lastPathPart, value);

  return obj;
}


function get (obj, dottedPath) {
  const pathParts = handleObjectPath(dottedPath);
  
  let nested = obj;

  for (let i = 0; i < pathParts.length; i++) {
    if (!nested[pathParts[i]]) {
      return null;
    }
    
    nested = nested[pathParts[i]];
  }

  return nested;
}


function handleObjectPath (objPath) {
  let pathParts;
 
  if (typeof objPath === "string") {
    pathParts = objPath.split(".");
  }
  else if (objPath && objPath.length) {
    pathParts = objPath;
  }
  else {
    throw new Error("path should be either dotted string or array of strings");
  }

  return pathParts;
}


function assignValue (objRef, key, value) {
  if (Array.isArray(objRef[key]) && Array.isArray(value)) {
    objRef[key].push(...value);
  }
  else if (isObject(objRef[key]) && isObject(value)) {
    Object.assign(objRef[key], value);
  }
  else {
    objRef[key] = value;
  }
}

function isObject(value) {
  return value !== null && typeof value === "object";
}


module.exports = {
  internals: {
    handleObjectPath
  },
  set,
  get
};
