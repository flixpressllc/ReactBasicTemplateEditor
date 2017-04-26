'use strict';
var __mockElements = {};

export function getElementById (id) {
  return __mockElements[id];
}

export function __setMockElement(id, object) {
  __mockElements[id] = object;
}
