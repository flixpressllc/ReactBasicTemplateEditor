require('jxon');
import * as hf from './helper-functions';

describe('traverseObject', () => {
  const traverseObject = hf.traverseObject;
  it('clones by default', () => {
    let originalObj = {one: {value:1}, two: {value:2}};
    let returnedObj = traverseObject(originalObj, (key, prop) => {prop.value = 3});
    expect(originalObj).toEqual({one: {value:1}, two: {value:2}});
  });

  it('returns an empty object by default', () => {
    let originalObj = {one: {value:1}, two: {value:2}};
    let returnedObj = traverseObject(originalObj, (key, prop) => {prop.value = 3});
    expect(returnedObj).toEqual({});
  });

  it('returns a constructed object when callback returns a valid array', () => {
    let originalObj = {one: {value:1}, two: {value:2}};
    let returnedObj = traverseObject(originalObj, (key, prop) => [key+'2', prop.value]);
    expect(returnedObj).toEqual({one2: 1, two2: 2});
  });

  it('will recurse if desired', () => {
    let originalObj = {one: {value:1}, two: {value:2}};
    let returnedObj = traverseObject(originalObj, (key, prop) => [key+'2', prop], true);
    expect(returnedObj).toEqual({one2: {value2:1}, two2: {value2:2}});
  });
});

describe('changePropsInitialCase', () => {
  let changePropsInitialCase = hf.changePropsInitialCase;
  it('changes props to upper', () => {
    let obj = {one: 1, two: 2};
    let returnObj = changePropsInitialCase(obj, 'UpperFirst');
    expect(returnObj).toEqual({'One': 1, 'Two': 2});
  });
  it('changes props to lower', () => {
    let obj =  {'One': 1, 'Two': 2};
    let returnObj = changePropsInitialCase(obj, 'lowerFirst');
    expect(returnObj).toEqual({one: 1, two: 2});
  });
});

describe('nestedPropertyDetails', () => {
  let nestedPropertyDetails = hf.nestedPropertyDetails;
  it('marks an existing property as true', () => {
    let obj = {level1: {level2: 'I am here'}};
    expect(nestedPropertyDetails(obj, 'level1.level2').exists).toEqual(true);
  });
  it('marks a missing property as false', () => {
    let obj = {level1: {level2: 'I am here'}};
    expect(nestedPropertyDetails(obj, 'level1.level2.level3').exists).toEqual(false);
  });
  it('provides the existing path', () => {
    let obj = {level1: {level2: 'I am here'}};
    expect(nestedPropertyDetails(obj, 'level1.level2.level3.level4').existingPath).toEqual('level1.level2');
  });
  it('provides the final found property', () => {
    let obj = {level1: {level2: 'I am here'}};
    expect(nestedPropertyDetails(obj, 'level1.level2.level3.level4').finalValidProperty).toEqual('I am here');
  });
});

describe('nestedPropertyTest', () => {
  let nestedPropertyTest = hf.nestedPropertyTest;
  it('returns false if a prop does not exist at some level', () => {
    let obj = {level1: {level2: 'I am here'}};

    expect(nestedPropertyTest(obj,'level1.level2.level3', (val) => true )).toEqual(false);
  });
  it('returns true for a successfull callback on an existing prop', () => {
    let obj = {level1: {level2: 'I am here'}};

    expect(nestedPropertyTest(obj,'level1.level2', (val) => val === 'I am here' )).toEqual(true);
  });
  it('returns false for an unsuccessful callback on an existing prop', () => {
    let obj = {level1: {level2: 'I am here'}};

    expect(nestedPropertyTest(obj,'level1.level2', (val) => val === 'I am not here' )).toEqual(false);
  });
});