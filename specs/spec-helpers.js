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

export function getSubmissionXmlFor (id) {
  if (isNotEmpty(submissionXMLById[id])) return submissionXMLById[id];

  // the PWD for this function will be at the project level
  submissionXMLById[id] = fs.readFileSync(`./specs/submissionXMLData/${id}.xml`).toString().replace('\r\n', '\n');

  return getSubmissionXmlFor(id);
}