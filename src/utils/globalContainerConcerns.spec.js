import { toType } from './helper-functions';
import {
  registerDataType,
  getDataTypeNames,
  getToRenderStringFunctionFor,
  getToDataObjectFunctionFor,
  getContainerNameFor,
  getDataTypeFor,
  __privateFunctions,
  __privateVars
} from './globalContainerConcerns';

describe('registerDataType', () => {
  beforeEach(__privateFunctions._resetValues);
  it('adds a data-type name to the list', () => {
    registerDataType('textField');
    expect(__privateVars()._dataTypeNames).toEqual(['textField']);
  });
  describe('when given only a data type name', () => {
    it('adds a container name based on the data type plus an "s"', () => {
      registerDataType('textField');
      expect(__privateVars()._containerNamesDictionary).toEqual({textField: 'textFields'});
    });
    it('adds a generic toRenderString function', () => {
      registerDataType('textField');
      expect(__privateVars()._toRenderStringFunctions.textField.toString())
        .toEqual(__privateFunctions._createGenericToRenderStringFunction().toString());
    });
    it('adds a generic toDataObject function', () => {
      registerDataType('textField');
      expect(__privateVars()._toDataObjectFunctions.textField.toString())
        .toEqual(__privateFunctions._createGenericToDataObjectFunction().toString());
    });
  });
  describe('when given a container name name', () => {
    it('adds the container name given', () => {
      registerDataType('textField', 'monkeyBox');
      expect(__privateVars()._containerNamesDictionary).toEqual({textField: 'monkeyBox'});
    });
  });
  describe('when given a toRenderString function', () => {
    it('adds that function to the lookup', () => {
      let theFunction = function textFieldToRenderString () { return 'hello'; };
      registerDataType('textField', null, theFunction);
      expect(__privateVars()._toRenderStringFunctions.textField.name)
        .toEqual('textFieldToRenderString');
    });
  });
  describe('when given a toDataObject function', () => {
    it('adds that function to the lookup', () => {
      let theFunction = function textFieldToDataObject () { return 'hello'; };
      registerDataType('textField', null, null, theFunction);
      expect(__privateVars()._toDataObjectFunctions.textField.name)
        .toEqual('textFieldToDataObject');
    });
  });
});

describe('getDataTypeNames', () => {
  beforeEach(__privateFunctions._resetValues);
  it('returns container names as an array', () => {
    __privateFunctions._addDataTypeName('one');
    __privateFunctions._addDataTypeName('two');
    __privateFunctions._addDataTypeName('three');
    expect(getDataTypeNames()).toEqual(['one', 'two', 'three']);
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


