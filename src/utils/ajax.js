export function getJSON(url) { return new Promise((resolve,reject) => {
  $.getJSON(url)
  .done( data => resolve(data) )
  .fail( data => reject(data) );
})}
