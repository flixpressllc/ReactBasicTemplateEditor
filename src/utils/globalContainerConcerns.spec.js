import { toType } from './helper-functions';
import {
  registerDataType,
  getContainerNames,
  getToRenderStringFunctionFor,
  getToDataObjectFunctionFor,
  getContainerNameFor,
  getDataTypeFor,
  __privateFunctions,
  __privateVars
} from './globalContainerConcerns';

function registerSomeFakeData () {

}

describe('registerDataType', () => {
  beforeEach(__privateFunctions._resetValues);
  pending();
});

describe('getContainerNames', () => {
  beforeEach(__privateFunctions._resetValues);
  it('returns container names as an array', () => {
    __privateFunctions._addContainerName('one');
    __privateFunctions._addContainerName('two');
    __privateFunctions._addContainerName('three');
    expect(getContainerNames()).toEqual(['one', 'two', 'three']);
  });
});

describe('getToRenderStringFunctionFor', () => {
  beforeEach(__privateFunctions._resetValues);
  it('returns the correct function for the given data type', () => {
    let fakeYtFunction = () => {return 'hello';};
    let fakeTextFieldFunction = () => {return 'hello there';};
    __privateFunctions._addToRenderStringFunction('youTubeLink', fakeYtFunction);
    __privateFunctions._addToRenderStringFunction('textField', fakeTextFieldFunction);

    expect(getToRenderStringFunctionFor('textField')).toBe(fakeTextFieldFunction);
    expect(getToRenderStringFunctionFor('youTubeLink')).toBe(fakeYtFunction);
  });
});

describe('getToDataObjectFunctionFor', () => {
  beforeEach(__privateFunctions._resetValues);
  it('returns the correct function for the given data type', () => {
    let fakeYtFunction = () => {return 'hello';};
    let fakeTextFieldFunction = () => {return 'hello there';};
    __privateFunctions._addToDataObjectFunction('youTubeLink', fakeYtFunction);
    __privateFunctions._addToDataObjectFunction('textField', fakeTextFieldFunction);

    expect(getToDataObjectFunctionFor('textField')).toBe(fakeTextFieldFunction);
    expect(getToDataObjectFunctionFor('youTubeLink')).toBe(fakeYtFunction);
  });
});

describe('getContainerNameFor', () => {
  beforeEach(__privateFunctions._resetValues);
  it('returns plural names for container names', () => {
    __privateFunctions._addPluralName('textField', 'textFields');
    __privateFunctions._addPluralName('textBox', 'textBoxes');
    expect(getContainerNameFor('textField')).toEqual('textFields');
    expect(getContainerNameFor('textBox')).toEqual('textBoxes');
  });
});

describe('getDataTypeFor', () => {
  beforeEach(__privateFunctions._resetValues);
  pending();
});

describe('_addPluralName', () => {
  beforeEach(__privateFunctions._resetValues);
  it('adds an s if no plural name is supplied', () => {
    __privateFunctions._addPluralName('textField');
    expect(getContainerNameFor('textField')).toEqual('textFields');
  });
});


