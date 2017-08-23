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

type ServerResponse = Array<
  {
    fullSizeUrl: string
    newFileName: string
    originalFileName: string
    thumbnailUrl: string
  }
>; // Pipe delineated string

export function uploadFilesToServer(files: File[], formFieldNames?: string[]): Promise<ServerResponse> {
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

export function uploadFileToServer(file: File, fieldName?: string): Promise<ServerResponse> {
  let fieldNames = fieldName ? [fieldName] : undefined;
  return uploadFilesToServer([file], fieldNames);
}

export function uploadImagesToServer(images: File[], fieldNames?: string[]): Promise<ImageUploadData> {
  return uploadFilesToServer(images, fieldNames)
    .then(filesArray => filesArray.map(file => file.newFileName));
}

export function uploadImageToServer(img: File): Promise<ImageUploadData> {
  return uploadImagesToServer([img], ['originalImage']);
}

export const fetch = window.fetch;
