import jxon from 'jxon';
// import jsb from 'js-beautify';

jxon.config({
  parseValues: true
});

export function prettyXML (str) {
  // return jsb.html(str);
  return str;
}

export default jxon;