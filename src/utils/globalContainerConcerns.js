import {
  isObject, valuesArrayFromObject, objectContainsValue,
  objectKeyForValue, toType } from './helper-functions';

let _dataTypeNames;
let _toRenderStringFunctions;
let _toDataObjectFunctions;
let _containerNamesDictionary;

function _resetValues () {
  _dataTypeNames = [];
  _toRenderStringFunctions = {};
  _toDataObjectFunctions = {};
  _containerNamesDictionary = {}; // Example: {textBox: 'textBoxes'};
}

_resetValues();

function _addDataTypeName (name) {
  if (typeof name === 'string' && _dataTypeNames.indexOf(name) === -1) {
    _dataTypeNames.push(name);
  } else {
    throw new Error(`Data-type name "${name}" already exists or is not a valid string.`);
  }
}

function _addToRenderStringFunction (dataTypeName, theFunction) {
  _toRenderStringFunctions[dataTypeName] = theFunction;
}

function _addToDataObjectFunction (dataTypeName, theFunction) {
  _toDataObjectFunctions[dataTypeName] = theFunction;
}

function _createGenericToRenderStringFunction () {
  return function genericToRenderString (containerDataNode) {
    if (!isObject(containerDataNode)) {
      throw new Error(`The containerDataNode given was not an object with a "value" property containing a string. Was ${containerDataNode}`);
    } else if (typeof containerDataNode.value !== 'string') {
      throw new Error(`The containerDataNode given did not have a "value" property containing a string. 'containerDataNode.value' was ${containerDataNode.value}`);
    }
    return containerDataNode.value;
  };
}

function _addGenericToRenderStringFunction (dataTypeName) {
  _toRenderStringFunctions[dataTypeName] = _createGenericToRenderStringFunction();
}

function _createGenericToDataObjectFunction () {
  return (containerDataNode, renderString) => {
    if (!isObject(containerDataNode)) {
      throw new Error(`The containerDataNode given was not an object. Was ${containerDataNode}`);
    }
    let newDataNode = clone(containerDataNode);
    newDataNode.value = renderString;
    return newDataNode;
  };
}

function _addGenericToDataObjectFunction (dataTypeName) {
  _toDataObjectFunctions[dataTypeName] = _createGenericToDataObjectFunction();
}

function _addPluralName (dataTypeName, dataTypeContainerName) {
  if (dataTypeContainerName === null || dataTypeContainerName === undefined) {
    dataTypeContainerName = dataTypeName + 's';
  }
  if (typeof dataTypeContainerName !== 'string') {
    throw new Error(`'dataTypeContainerName' name "${dataTypeContainerName}" is not a valid string.`);
  }
  if (objectContainsValue(dataTypeContainerName, _containerNamesDictionary)) {
    throw new Error(`The name ${dataTypeContainerName} was already registered.`);
  }
  _containerNamesDictionary[dataTypeName] = dataTypeContainerName;
}

export function registerDataType (dataTypeName, dataTypeContainerName, toRenderStringFunction, toDataObjectFunction) {
  _addDataTypeName(dataTypeName);
  _addPluralName(dataTypeName, dataTypeContainerName)
  if (toRenderStringFunction) {
    _addToRenderStringFunction(dataTypeName, toRenderStringFunction);
  } else {
    _addGenericToRenderStringFunction(dataTypeName);
  }
  if (toDataObjectFunction) {
    _addToDataObjectFunction(dataTypeName, toDataObjectFunction);
  } else {
    _addGenericToDataObjectFunction(dataTypeName);
  }
}

export function getDataTypeNames () {
  // Always will contain strings. No need for the clone function
  return [].concat(_dataTypeNames);
}

export function getToRenderStringFunctionFor (dataTypeName) {
  let desiredFunction = _toRenderStringFunctions[dataTypeName];
  if ( toType(desiredFunction) !== 'function' ) {
    throw new Error(`A toRenderString function for ${dataTypeName} does not exist. The actual returned value was of type ${toType(desiredFunction)}`)
  }
  return desiredFunction;
}

export function getToDataObjectFunctionFor (dataTypeName) {
  let desiredFunction = _toDataObjectFunctions[dataTypeName];
  if ( toType(desiredFunction) !== 'function' ) {
    throw new Error(`A toDataObject function for ${dataTypeName} does not exist. The actual returned value was of type ${toType(desiredFunction)}`)
  }
  return desiredFunction;
}

export function getDataTypeFor (dataTypeContainerName) {
  let key = objectKeyForValue(dataTypeContainerName, _containerNamesDictionary);
  if (key === false) {
    throw new Error(`There is no plural container name called ${dataTypeContainerName}.`);
  }
  return key;
}

export function getContainerNameFor (dataTypeName) {
  let pluralName = _containerNamesDictionary[dataTypeName];
  if (toType(pluralName) !== 'string') {
    throw new Error(`There is no plural name registered for ${dataTypeName}.`);
  }
  return pluralName;
}

let __privateFunctions = {
  _resetValues,
  _addDataTypeName,
  _addPluralName,
  _addToDataObjectFunction,
  _addToRenderStringFunction,
  _addGenericToRenderStringFunction,
  _addGenericToDataObjectFunction,
  _createGenericToDataObjectFunction,
  _createGenericToRenderStringFunction
};

let __privateVars = () => { return {
  _dataTypeNames,
  _toRenderStringFunctions,
  _toDataObjectFunctions,
  _containerNamesDictionary
}};

export { __privateFunctions, __privateVars };