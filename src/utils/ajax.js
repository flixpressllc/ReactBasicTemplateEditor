import Promise from 'promise/lib/es6-extensions';
import 'whatwg-fetch'; // polyfill

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
