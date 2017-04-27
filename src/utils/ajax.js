import Promise from 'promise/lib/es6-extensions';
import 'whatwg-fetch'; // polyfill

/**
 * reduced functionality ajax wrapper. Assumes jquery for now, but is easily switched
 *
 * @param {url} String (optional)
 * @param {options} Object (optional) {
      url,           // ex: 'http://something.com/page'
      dataType,      // ex: 'xml'
      type,          // ex: 'GET'
      data           // ex: {username: username, page:1, pageSize: 1000}
    }
 * @returns {Promise} on resolve: {
      data: Various (response data)
      status: Number (status number)
      statusText: String (things like "OK" or "Forbidden")
      getResponseHeader: Function (pass in a string of the header type, get the value)
    }
    on reject: Error
 */
export function ajax(url, options) {
  // jQuery.ajax starts with this trick, and so should we
  if ( typeof url === 'object' ) {
    options = url;
    url = undefined;
  }

  // set allowed options:
  let filteredOptions = {}
  let allowedOptions = [
    'url',
    'dataType',
    'type',
    'data'
  ]
  // filter options
  for (let prop in options) {
    if (!options.hasOwnProperty(prop)) continue;
    if ( allowedOptions.indexOf(prop) !== -1) filteredOptions[prop] = options[prop];
  }

  let jqAjax = $.ajax(url, filteredOptions);

  // jqAjax.done((d,s,j)=>{debugger;})

  class AjaxRequest extends Promise {
    abort() { jqAjax.abort(...arguments) }
  }
  // Promise naturally has .then() and .catch() methods.
  let promise = new AjaxRequest((resolve,reject) => {
    jqAjax.done( (data, status, jqXHR) => {
      // let headers = jqXHR.getAllResponseHeaders().split('\n').reduce((a,plainTextHeader) => {
      //   console.log(plainTextHeader)
      //   let keyValArr = plainTextHeader.split(': ').map(v => trim(v));
      //   a[keyValArr.shift()] = keyValArr.join(': ');
      //   return a;
      // }, {})
      let getResponseHeader = function getResponseHeader (name) {
        return jqXHR.getResponseHeader(name);
      }
      return resolve({data, statusText: status, status: jqXHR.status, getResponseHeader})
    });
    jqAjax.fail( (jqXHR, status, error) => reject(error) );
  });

  return promise;
}

const fetch = window.fetch;
export function getJSON(url) {
  return new Promise( (resolve, reject) => {
    window.fetch(url).then(response => {
      if (response.status === 200) {
        response.json().then(json => resolve(json));
      } else {
        reject(new Error(`The request to ${url} failed.`));
      }
    }, error => reject(error) );
  });
}

export { fetch };
