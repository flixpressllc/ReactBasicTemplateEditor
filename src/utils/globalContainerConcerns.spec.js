import { toType } from './helper-functions';
import {
  registerDataType,
  getDataTypeNames,
  getContainerNames,
  getToRenderStringFunctionFor,
  getToDataObjectFunctionFor,
  getContainerNameFor,
  getDataTypeNameFor,

  _resetValues,
  _createGenericToRenderStringFunction,
  _createGenericToDataObjectFunction,
  __privateVars
} from './globalContainerConcerns';

describe('registerDataType', () => {
  beforeEach(_resetValues);
  describe('when given a string in the first argument', () => {
    it('adds a data-type name to the list', () => {
      registerDataType('textField');
      expect(getDataTypeNames()).toEqual(['textField']);
    });
  });
  describe('when given an object in the first argument', () => {
    it('requires the "name" property', () => {
      expect( () => registerDataType({}) ).toThrow();
    });
  });
  describe('when given only a data type name', () => {
    it('adds a container name based on the data type plus an "s"', () => {
      registerDataType('textField');
      expect(getContainerNames()).toEqual(['textFields']);
    });
    it('adds a generic toRenderString function', () => {
      registerDataType('textField');
      expect(getToRenderStringFunctionFor('textField').name)
        .toEqual(_createGenericToRenderStringFunction().name);
    });
    it('adds a generic toDataObject function', () => {
      registerDataType('textField');
      expect(getToDataObjectFunctionFor('textField').name)
        .toEqual(_createGenericToDataObjectFunction().name);
    });
  });
  describe('when given a container name', () => {
    it('adds the container name given', () => {
      registerDataType('textField', {containerName: 'monkeyBox'});
      expect(getContainerNameFor('textField')).toEqual('monkeyBox');
    });
  });
  describe('when given a toRenderString function', () => {
    it('adds that function to the lookup', () => {
      let theFunction = function textFieldToRenderString () { return 'hello'; };
      registerDataType('textField', {toRenderString: theFunction});
      expect(getToRenderStringFunctionFor('textField').name)
        .toEqual('textFieldToRenderString');
    });
  });
  describe('when given a toDataObject function', () => {
    it('adds that function to the lookup', () => {
      let theFunction = function textFieldToDataObject () { return 'hello'; };
      registerDataType('textField', {toDataObject: theFunction});
      expect(getToDataObjectFunctionFor('textField').name)
        .toEqual('textFieldToDataObject');
    });
  });
});

describe('getDataTypeNames', () => {
  beforeEach(_resetValues);
  it('returns data type names as an array', () => {
    registerDataType('one');
    registerDataType('two');
    registerDataType('three');
    expect(getDataTypeNames()).toEqual(['one', 'two', 'three']);
  });
});

describe('getContainerNames', () => {
  beforeEach(_resetValues);
  it('returns container names as an array', () => {
    registerDataType('one');
    registerDataType('two');
    registerDataType('three');
    expect(getContainerNames()).toEqual(['ones', 'twos', 'threes']);
  });
});

describe('getToRenderStringFunctionFor', () => {
  beforeEach(_resetValues);
  it('returns the correct function for the given data type', () => {
    let fakeYtFunction = () => {return 'hello';};
    let fakeTextFieldFunction = () => {return 'hello there';};
    registerDataType('youTubeLink', {toRenderString: fakeYtFunction});
    registerDataType('textField', {toRenderString: fakeTextFieldFunction});

    expect(getToRenderStringFunctionFor('textField')).toBe(fakeTextFieldFunction);
    expect(getToRenderStringFunctionFor('youTubeLink')).toBe(fakeYtFunction);
  });
});

describe('getToDataObjectFunctionFor', () => {
  beforeEach(_resetValues);
  it('returns the correct function for the given data type', () => {
    let fakeYtFunction = () => {return 'hello';};
    let fakeTextFieldFunction = () => {return 'hello there';};
    registerDataType('youTubeLink', {toDataObject: fakeYtFunction});
    registerDataType('textField', {toDataObject: fakeTextFieldFunction});

    expect(getToDataObjectFunctionFor('textField')).toBe(fakeTextFieldFunction);
    expect(getToDataObjectFunctionFor('youTubeLink')).toBe(fakeYtFunction);
  });
});

describe('getContainerNameFor', () => {
  beforeEach(_resetValues);
  it('returns container names for data type names', () => {
    registerDataType('textField');
    registerDataType('textBox', {containerName: 'textBoxes'});
    expect(getContainerNameFor('textField')).toEqual('textFields');
    expect(getContainerNameFor('textBox')).toEqual('textBoxes');
  });
});

describe('getDataTypeNameFor', () => {
  beforeEach(_resetValues);
  it('returns the proper data type name for a given container name', () => {
    registerDataType('textField');
    registerDataType('textBox', {containerName: 'textBoxes'});
    expect(getDataTypeNameFor('textFields')).toEqual('textField');
    expect(getDataTypeNameFor('textBoxes')).toEqual('textBox');
  });
});

describe('generic toRenderString and toDataObject functions', () => {
  it('renderString to object back to renderString should equal original renderString', () => {
    const renderString = 'Flixpress.com';
    const toDataObject = _createGenericToDataObjectFunction();
    const toRenderString = _createGenericToRenderStringFunction();

    let result = toRenderString(toDataObject(renderString, {}));

    expect(result).toEqual('Flixpress.com');
  });
  it('toDataObject ought to assign a "value" property', () => {
    const renderString = 'Flixpress.com';
    const toDataObject = _createGenericToDataObjectFunction();

    let result = toDataObject(renderString, {});

    expect(result).toEqual({value: 'Flixpress.com'});
  });
  it('toDataObject ought to overwrite a "value" property', () => {
    const renderString = 'Flixpress.com';
    const toDataObject = _createGenericToDataObjectFunction();

    let result = toDataObject(renderString, {value: 'other value'});

    expect(result.value).toEqual('Flixpress.com');
  });
  it('toDataObject ought to preserve the other properties of the object passed in', () => {
    const renderString = 'Flixpress.com';
    const toDataObject = _createGenericToDataObjectFunction();

    let result = toDataObject(renderString, {name: 'SomeTextString'});

    expect(result.name).toEqual('SomeTextString');
  });
});
