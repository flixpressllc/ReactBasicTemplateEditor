import {
  isObject, valuesArrayFromObject, objectContainsValue,
  objectKeyForValue, toType } from './helper-functions';

let _dataTypeNames;
let _toRenderStringFunctions;
let _toDataObjectFunctions;
let _pluralsDictionary;

function _resetValues () {
  _dataTypeNames = [];
  _toRenderStringFunctions = {};
  _toDataObjectFunctions = {};
  _pluralsDictionary = {}; // Example: {textBox: 'textBoxes'};
}

_resetValues();

function _addContainerName (name) {
  if (typeof name === 'string' && _dataTypeNames.indexOf(name) === -1) {
    _dataTypeNames.push(name);
  } else {
    throw new Error(`Container name "${name}" already exists or is not a valid string.`);
  }
}

function _addToRenderStringFunction (dataType, theFunction) {
  _toRenderStringFunctions[dataType] = theFunction;
}

function _addToDataObjectFunction (dataType, theFunction) {
  _toDataObjectFunctions[dataType] = theFunction;
}

function _addGenericToRenderStringFunction (dataType) {
  _toRenderStringFunctions[dataType] = (containerDataNode) => {
    if (!isObject(containerDataNode)) {
      throw new Error(`The containerDataNode given was not an object with a "value" property containing a string. Was ${containerDataNode}`);
    } else if (typeof containerDataNode.value !== 'string') {
      throw new Error(`The containerDataNode given did not have a "value" property containing a string. 'containerDataNode.value' was ${containerDataNode.value}`);
    }
    return containerDataNode.value;
  };
}

function _addGenericToDataObjectFunction (dataType) {
  _toDataObjectFunctions[dataType] = (containerDataNode, renderString) => {
    if (!isObject(containerDataNode)) {
      throw new Error(`The containerDataNode given was not an object. Was ${containerDataNode}`);
    }
    let newDataNode = clone(containerDataNode);
    newDataNode.value = renderString;
    return newDataNode;
  };
}

function _addPluralName (dataType, dataTypeContainerName) {
  if (dataTypeContainerName === null || dataTypeContainerName === undefined) {
    dataTypeContainerName = dataType + 's';
  }
  if (typeof dataTypeContainerName !== 'string') {
    throw new Error(`'dataTypeContainerName' name "${dataTypeContainerName}" is not a valid string.`);
  }
  if (objectContainsValue(dataTypeContainerName, _pluralsDictionary)) {
    throw new Error(`The name ${dataTypeContainerName} was already registered.`);
  }
  _pluralsDictionary[dataType] = dataTypeContainerName;
}

export function registerDataType (dataType, dataTypeContainerName, toRenderStringFunction, toDataObjectFunction) {
  _addContainerName(dataType);
  _addPluralName(dataType, dataTypeContainerName)
  if (toRenderStringFunction && toDataObjectFunction) {
    _addToRenderStringFunction(dataType, toRenderStringFunction);
    _addToDataObjectFunction(dataType, toDataObjectFunction);
  } else {
    _addGenericToRenderStringFunction(dataType);
    _addGenericToDataObjectFunction(dataType);
  }
}

export function getContainerNames () {
  // Always will contain strings. No need for the clone function
  return [].concat(_dataTypeNames);
}

export function getToRenderStringFunctionFor (dataType) {
  let desiredFunction = _toRenderStringFunctions[dataType];
  if ( toType(desiredFunction) !== 'function' ) {
    throw new Error(`A toRenderString function for ${dataType} does not exist. The actual returned value was of type ${toType(desiredFunction)}`)
  }
  return desiredFunction;
}

export function getToDataObjectFunctionFor (dataType) {
  let desiredFunction = _toDataObjectFunctions[dataType];
  if ( toType(desiredFunction) !== 'function' ) {
    throw new Error(`A toDataObject function for ${dataType} does not exist. The actual returned value was of type ${toType(desiredFunction)}`)
  }
  return desiredFunction;
}

export function getDataTypeFor (dataTypeContainerName) {
  let key = objectKeyForValue(dataTypeContainerName, _pluralsDictionary);
  if (key === false) {
    throw new Error(`There is no plural container name called ${dataTypeContainerName}.`);
  }
  return key;
}

export function getContainerNameFor (dataType) {
  let pluralName = _pluralsDictionary[dataType];
  if (toType(pluralName) !== 'string') {
    throw new Error(`There is no plural name registered for ${dataType}.`);
  }
  return pluralName;
}

let __privateFunctions = {
  _resetValues,
  _addContainerName,
  _addPluralName,
  _addToDataObjectFunction,
  _addToRenderStringFunction
};

let __privateVars = {
  _dataTypeNames,
  _toRenderStringFunctions,
  _toDataObjectFunctions,
  _pluralsDictionary
};

export { __privateFunctions, __privateVars };