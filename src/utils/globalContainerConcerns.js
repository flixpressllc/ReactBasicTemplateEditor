import {
  isObject, valuesArrayFromObject, objectContainsValue,
  objectKeyForValue, toType, isEmpty, clone } from './helper-functions';

let _dataTypeNames;
let _toRenderStringFunctions;
let _toDataObjectFunctions;
let _containerNamesDictionary;

export function _resetValues () {
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

export function _createGenericToRenderStringFunction () {
  return function genericToRenderString (containerDataNode) {
    if (!isObject(containerDataNode)) {
      throw new Error(`The containerDataNode given was not an object with a "value" property containing a string. Was ${containerDataNode}`);
    } else if (typeof containerDataNode.value !== 'string') {
      // try a default option:
      if (toType(containerDataNode.default) === 'string') {
        return containerDataNode.default;
      }
      throw new Error(`The containerDataNode given did not have a "value" property containing a string. 'containerDataNode.value' was ${toType(containerDataNode.value)}. containerDataNode: ${JSON.stringify(containerDataNode)}`);
    }
    return containerDataNode.value;
  };
}

function _addGenericToRenderStringFunction (dataTypeName) {
  _toRenderStringFunctions[dataTypeName] = _createGenericToRenderStringFunction();
}

export function _createGenericToDataObjectFunction () {
  return (renderString, containerDataNode) => {
    if (!isObject(containerDataNode)) {
      throw new Error(`The containerDataNode given was not an object. Was ${toType(containerDataNode)}. This function must merge an already-defined object with previous render data.`);
    }
    let newDataNode = clone(containerDataNode);
    newDataNode.value = renderString;
    return newDataNode;
  };
}

function _addGenericToDataObjectFunction (dataTypeName) {
  _toDataObjectFunctions[dataTypeName] = _createGenericToDataObjectFunction();
}

function _addContainerName (dataTypeName, containerName) {
  if (containerName === null || containerName === undefined || containerName === '') {
    containerName = dataTypeName + 's';
  }
  if (typeof containerName !== 'string') {
    throw new Error(`Second argument for \`_addContainerName\` must be either empty or a string. Was given ${toType(containerName)}`);
  }
  if (objectContainsValue(containerName, _containerNamesDictionary)) {
    throw new Error(`The name "${containerName}" was already registered.`);
  }
  _containerNamesDictionary[dataTypeName] = containerName;
}

export function registerDataType (dataTypeName, options = {}) {
  if (typeof dataTypeName === 'string') {
    options.name = dataTypeName;
  } else if (isObject(dataTypeName)) {
    options = dataTypeName;
    if (isEmpty(options.name)) {
      throw new Error('When an object is given as the first argument for `registerDataType`, the `name` property must be included.')
    }
  } else {
    throw new Error(`The first argument for registerDataType must be either a string or an object. Was ${toType(dataTypeName)}`);
  }


  _addDataTypeName(options.name);
  _addContainerName(options.name, options.containerName)
  if (options.toRenderString) {
    _addToRenderStringFunction(dataTypeName, options.toRenderString);
  } else {
    _addGenericToRenderStringFunction(options.name);
  }
  if (options.toDataObject) {
    _addToDataObjectFunction(dataTypeName, options.toDataObject);
  } else {
    _addGenericToDataObjectFunction(options.name);
  }
}

export function getDataTypeNames () {
  // Always will contain strings. No need for the clone function
  return [].concat(_dataTypeNames);
}

export function getContainerNames () {
  // Always will contain strings. No need for the clone function
  return [].concat(valuesArrayFromObject(_containerNamesDictionary));
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

export function getDataTypeNameFor (dataTypeContainerName) {
  let key = objectKeyForValue(dataTypeContainerName, _containerNamesDictionary);
  if (key === false) {
    throw new Error(`There is no container name called "${dataTypeContainerName}"`);
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

let __privateVars = () => { return {
  _dataTypeNames,
  _toRenderStringFunctions,
  _toDataObjectFunctions,
  _containerNamesDictionary
}};

export { __privateVars };