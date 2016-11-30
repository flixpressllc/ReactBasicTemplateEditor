import Promise from 'promise/lib/es6-extensions';

export function ajax(url, options) {
  // jQuery.ajax starts with this trick, and so should we
  if ( typeof url === 'object' ) {
    options = url;
    url = undefined;
  }

  // set allowed options:
  let filteredOptions = {}
  let allowedOptions = [
    'url',           // ex: 'http://something.com/page'
    'dataType',      // ex: 'xml'
    'type',          // ex: 'GET'
    'data'           // ex: {username: username, page:1, pageSize: 1000}
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
    jqAjax.done( (data, status, jqXHR) => resolve({data: data, status: status, jqXHR:jqXHR}) );
    jqAjax.fail( (jqXHR, status, error) => reject(error) );
  });

  return promise;
}

export function getJSON(url) {
  return ajax({url: url, dataType: 'json'});
}
