import jxon from 'jxon';

jxon.config({
  parseValues: true
});

export function xmlStringToObject (string) {
  return jxon.stringToJs(string);
}

export function objectToXml (obj) {
  return jxon.jsToString(obj);
}

export function nativeXmlToObject (xml) {
  return jxon.xmlToJs(xml);
}