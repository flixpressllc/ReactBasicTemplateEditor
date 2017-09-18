export const EXTENSIONS_BY_MIME_TYPE: {[key: string]: string} = {
  'image/jpeg': 'jpg',
  'image/png': 'png'
}

export const DATA_URL_MIME_MATCHER = /:(.*?);/;

//**dataURL to blob**
export function dataURLtoBlob(dataurl: string) {
    const {bytes, type} = dataURLtoByteArrayAndMimeType(dataurl);
    return new Blob([bytes], {type}); // broken in IE < 10
}

function getMimeFromDataUrl (dataurl: string) {
  var arr = dataurl.split(',')
  var mimeMatchOrNull = arr[0].match(DATA_URL_MIME_MATCHER);
  if (mimeMatchOrNull) {
    return mimeMatchOrNull;
  } else {
    throw new Error(`There was no mime to pull from string ${dataurl}`);
  }
}

function dataURLtoByteArrayAndMimeType (dataurl: string) {
  var arr = dataurl.split(',')
  var mimeMatchOrNull = arr[0].match(DATA_URL_MIME_MATCHER);
  var mime = mimeMatchOrNull![1];
  var bstr = atob(arr[1])
  var n = bstr.length
  var u8arr = new Uint8Array(n);
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
  }
  return {bytes: u8arr, type: mime};
}

export function getMimeTypeFromDataUrl (dataurl: string) {
  var arr = dataurl.split(',')
  var mimeMatchOrNull = arr[0].match(DATA_URL_MIME_MATCHER);
  var mime = mimeMatchOrNull![1];
  return mime;
}

//**blob to dataURL**
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise (resolve => {
    var a:FileReader = new FileReader();
    a.onload = function(e: FileReaderEvent) {
      resolve(e.target.result);
    }
    a.readAsDataURL(blob); // broken in IE < 10
  })
};

export function dataURLtoFile(dataurl: string, name: string) {
  const {bytes, type} = dataURLtoByteArrayAndMimeType(dataurl);
    name = name || 'unnamed';
    return new File([bytes], name, {type}); // Broken in IE <= 11  // TODO: fix this
}

export function getExtensionFromFileName(name: string) {
  return name.split('.').pop();
}

export function getExtensionForMimeType (mime: string) {
  const ext = EXTENSIONS_BY_MIME_TYPE[mime];
  if (!ext) throw new Error(`no file extension found for mime type "${mime}"`);
  return ext;
}

export function mimeTypeForExtension (ext: string) {
  let mime: string|false = false;
  for (let possibleMime in EXTENSIONS_BY_MIME_TYPE) {
    if (EXTENSIONS_BY_MIME_TYPE[possibleMime] === ext) mime = possibleMime;
  }
  if (!mime) throw new Error(`no mime type found for extension "${mime}"`);
  return mime;
}
