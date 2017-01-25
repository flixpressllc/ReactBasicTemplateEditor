import {
  registerDataType,
  getContainerNames,
  getToRenderStringFunctionFor,
  getToDataObjectFunctionFor,
  getContainerNameFor,
  getDataTypeFor,
  __testingFunctions,
  __privateVars
} from './globalContainerConcerns';

function registerSomeFakeData () {

}

describe('registerDataType', () => {
  beforeEach(__testingFunctions._resetValues);
  pending();
});

describe('getContainerNames', () => {
  beforeEach(__testingFunctions._resetValues);
  it('returns container names as an array', () => {
    __testingFunctions._addContainerName('one');
    __testingFunctions._addContainerName('two');
    __testingFunctions._addContainerName('three');
    expect(getContainerNames()).toEqual(['one', 'two', 'three']);
  });
});

describe('getToRenderStringFunctionFor', () => {
  beforeEach(__testingFunctions._resetValues);
  pending();
});

describe('getToDataObjectFunctionFor', () => {
  beforeEach(__testingFunctions._resetValues);
  pending();
});

describe('getContainerNameFor', () => {
  beforeEach(__testingFunctions._resetValues);
  it('returns plural names for container names', () => {
    __testingFunctions._addPluralName('textField', 'textFields');
    __testingFunctions._addPluralName('textBox', 'textBoxes');
    expect(getContainerNameFor('textField')).toEqual('textFields');
    expect(getContainerNameFor('textBox')).toEqual('textBoxes');
  });
});

describe('getDataTypeFor', () => {
  beforeEach(__testingFunctions._resetValues);
  pending();
});

describe('_addPluralName', () => {
  beforeEach(__testingFunctions._resetValues);
  it('adds an s if no plural name is supplied', () => {
    __testingFunctions._addPluralName('textField');
    expect(getContainerNameFor('textField')).toEqual('textFields');
  });
});


