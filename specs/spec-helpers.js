import { isNotEmpty } from '../src/utils/helper-functions';
import fs from 'fs';

export function classes (classesString) {
  let classes = classesString || '';
  if (typeof classes === 'object') {
    classes = classes.baseVal;
  }
  classes = classes.replace(/\s/g, ' ');
  return classes.split(' ');
}

let submissionXMLById = {};
let mockOrderObjById = {};

export function getSubmissionXmlFor (id) {
  if (isNotEmpty(submissionXMLById[id])) return submissionXMLById[id];

  // the PWD for this function will be at the project level
  submissionXMLById[id] = fs.readFileSync(`./specs/submissionXMLData/${id}.xml`).toString().replace('\r\n', '\n');

  return getSubmissionXmlFor(id);
}

export function getMockOrderObject (id) {
  if (isNotEmpty(mockOrderObjById[id])) return mockOrderObjById[id];

  // the PWD for this function will be at the project level
  mockOrderObjById[id] = require(`./mockOrderObjects/${id}`).default;

  return getMockOrderObject(id);
}