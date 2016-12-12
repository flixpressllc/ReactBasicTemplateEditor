'use strict';
// const realConfirm = jest.genMockFromModule('../confirm');

let thenMock = jest.fn();
let testCall = jest.fn();
let confirm = jest.fn ((confirmationReactElement, options) => {
  testCall();
  return {then: getThenMock};
});

export function getThenMock () {
  return thenMock;
}
export function __setThenMock (fn) {
  thenMock = fn;
}

export function defineTestCall (fn) {
  testCall = fn;
  return testCall;
}

export default confirm;
