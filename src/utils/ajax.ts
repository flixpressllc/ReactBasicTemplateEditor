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

type ImagesUploadServerResponse = Array<
  {
    fullSizeUrl: string
    newFileName: string
    originalFileName: string
    thumbnailUrl: string
  }
>; // Pipe delineated string

export function uploadImagesToServer(files: File[], formFieldNames?: string[]): Promise<ImagesUploadServerResponse> {
  return new Promise((resolve, reject) => {
    let userFiles = new FormData();

    files.map((file, i) => {
      const formFieldName = formFieldNames && formFieldNames[i] ? formFieldNames[i] : file.name;
      userFiles.append(formFieldName, file);
    })

    window.fetch('/api/v0.1/UploadImage.aspx', {
      method: 'POST',
      body: userFiles
    }).then(response => {
      if (response.status === 200) {
        response.json().then(resolve);
      } else {
        reject(response);
      }
    }, error => {
      console.error(error);
      reject(error);
    })
  })
}

export function uploadImageToServer(img: File): Promise<ImagesUploadServerResponse> {
  return uploadImagesToServer([img], ['originalImage'])

}

export function uploadImageToServerAndGetNewName(img: File): Promise<string> {
  return uploadImageToServer(img)
    .then(filesArray => filesArray.map(f => f.newFileName)[0]);
}

export const fetch = window.fetch;
