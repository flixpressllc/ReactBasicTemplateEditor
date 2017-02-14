'use strict';
// export function find(selector) {
//   return $(selector);
// }

var __mockElements = {};

export function getElementById (id) {
  return __mockElements[id];
}

export function __setMockElement(id, object) {
  __mockElements[id] = object;
}
