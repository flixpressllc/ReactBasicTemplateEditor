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