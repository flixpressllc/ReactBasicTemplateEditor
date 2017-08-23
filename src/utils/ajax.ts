import 'whatwg-fetch'; // polyfill

export function getJSON(url: string) {
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

function toQueryString (obj: object) {
  var parts = [];
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      parts.push(encodeURIComponent(i) + '=' + encodeURIComponent((<any>obj)[i]));
    }
  }
  return parts.join('&');
}

export function fetchWithParams (url: string, params: object) {
  return window.fetch(url + '?' + toQueryString(params));
}

type ServerResponse = string; // Pipe delineated string

export function uploadFileToServer(file: File): Promise<FileUploadData> {
  return new Promise((resolve, reject) => {
    let userFiles = new FormData();
    userFiles.append(file.name, file);

    window.fetch('/templates/Upload.aspx', {
      method: 'POST',
      body: userFiles
    }).then(response => {
      if (response.status === 200) {
        response.text().then((text: ServerResponse) => resolve(text.split('|')));
      } else {
        reject(response);
      }
    }, error => {
      console.error(error);
      reject(error);
    })
  })
}

export function uploadImageToServer(img: File) {
  return uploadFileToServer(img);
}

export const fetch = window.fetch;
