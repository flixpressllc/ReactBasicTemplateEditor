import Promise from 'promise/lib/es6-extensions';
import 'whatwg-fetch'; // polyfill

function abortableFetch () {
  let rejectInAbort;
  const fetchArgs = arguments;
  const url = arguments.length < 2 ? arguments[0] : arguments[1].url;
  const p = new Promise( (resolve, reject) => {
    rejectInAbort = reject;
    window.fetch(...fetchArgs);
  });

  p['abort'] = () => {
    rejectInAbort(new Error(`Ajax call to ${url} was aborted.`));
    return p;
  };

  return p;
}

export function getJSON(url) {
  let fetchAbort;
  const p = new Promise( (resolve, reject) => {
    const fetchJSON = abortableFetch(url);
    fetchAbort = fetchJSON.abort;
    fetchJSON.then(response => {
      if (response.status === 200) {
        response.json().then(json => resolve(json));
      } else {
        reject(new Error(`The request to ${url} failed.`));
      }
    }, error => reject(error) );

  });

  p['abort'] = fetchAbort;

  return p;
}

function toQueryString (obj) {
  var parts = [];
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      parts.push(encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]));
    }
  }
  return parts.join('&');
}

export function fetchWithParams (url, params) {
  return window.fetch(url + '?' + toQueryString(params));
}

export const fetch = window.fetch;
