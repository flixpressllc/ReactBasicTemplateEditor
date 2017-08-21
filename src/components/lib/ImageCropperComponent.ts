import CroppingImplementation from './wrappers/CroppingImplementation';
import { blobToDataURL, DATA_URL_MIME_MATCHER } from './fileManipulation';

type CroppedFileData = {
  cropData?: object,
  thumbnailDataUrl?: string,
  thumbnailBlob?: Blob,
  thumbnailFile?: File,
  croppedFile?: File,
  cancelled: boolean
}

function temporarilyAddStylesUntilCssFilesExist () {
  const styleId = 'temporaryImageCropperStyles';
  if (document.querySelector(`#${styleId}`)) return;
  const styles = document.createElement('style');
  styles.setAttribute('id', styleId);
  styles.innerHTML = `
    .frixxerAdminClient-ImageCropper {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: white;
      overflow: auto;
    }

    .frixxerAdminClient-ImageCropper img {
      max-width: 100%;
    }

    #cropperContainer {
      max-width: 100%;
    }

    body.__cropModalOpen {
      overflow: hidden;
    }
  `;

  document.body.appendChild(styles);
  const linkToCropperCss = document.createElement('link');
  linkToCropperCss.setAttribute('rel', 'stylesheet');
  linkToCropperCss.setAttribute('href', 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/0.8.1/cropper.min.css');
  document.head.appendChild(linkToCropperCss);
}

//resolves with boolean false if image is already small enough, or with dataURL of resized image
export function resizeImageSourceToDataUrl (src: string, desiredWidth: number, optionalMime: string) {
  return new Promise( function (resolve) {
    let mimeTypePromise: Promise<string>;
    if (optionalMime) {
      mimeTypePromise = Promise.resolve(optionalMime);
    } else {
      mimeTypePromise = discoverImageMimeTypeFromSrc(src);
    }

    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function () {
      if (img.naturalWidth <= desiredWidth) {
        resolve(false);
        return;
      }
      var canvas = document.createElement('canvas') as HTMLCanvasElement;
      var ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
      canvas.width = desiredWidth;
      canvas.height = canvas.width * (img.naturalHeight / img.naturalWidth);

      /// step 1
      var oc = document.createElement('canvas') as HTMLCanvasElement,
          octx = oc.getContext('2d') as CanvasRenderingContext2D;

      oc.width = img.naturalWidth * 0.5;
      oc.height = img.naturalHeight * 0.5;
      octx.drawImage(img, 0, 0, oc.width, oc.height);

      /// step 2
      octx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5);

      ctx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5,
      0, 0, canvas.width, canvas.height);

      mimeTypePromise.then(mimeType => resolve(canvas.toDataURL(mimeType)));
    }
    img.src = src;
  });
};

export function  discoverImageMimeTypeFromSrc (fileNameOrDataUrl: string): Promise<string> { return new Promise( (resolve, reject) => {
    const firstSeveralChars = fileNameOrDataUrl.slice(0,16);
    const dataUrlMatch = firstSeveralChars.match(DATA_URL_MIME_MATCHER);
    if ( dataUrlMatch !== null ) {
      resolve(dataUrlMatch[1]);
      return;
    }

    const extensionMatch = fileNameOrDataUrl.match(/\.(jpg|jpeg|png)$/);
    if (extensionMatch !== null) {
      const mime = extensionMatch[1] === 'png' ? 'image/png' : 'image/jpeg';
      resolve(mime);
      return;
    }

    reject(new Error(`no discoverable image mime type in string beginning with ${firstSeveralChars}`));
  })
};

class ImageCropper {

  elements: any;
  croppingImplementation: CroppingImplementation;
  _resolvePromise: (data: CroppedFileData) => Promise<CroppedFileData>;
  _rejectPromise: Function;
  previousCropData: object;
  baseElement: HTMLElement;
  imageElement: HTMLImageElement;
  originalBlob: Blob;
  originalWidth: number;
  originalHeight: number;

  constructor () {
    this.elements = {};
    this._cancel = this._cancel.bind(this);
    this._confirmCrop = this._confirmCrop.bind(this);

    temporarilyAddStylesUntilCssFilesExist();

    this._createModal();
  }

  _cancel () {
    this._resolvePromiseWithCancelled();
    this._removeCropperFromDocument();
  }

  _confirmCrop () {
    this._resolvePromiseWithNewCroppingAndDataUrl();
    this._removeCropperFromDocument();
  }

  _resolvePromiseWithNewCroppingAndDataUrl () {
    const cropData = this.croppingImplementation.getCropData();
    const thumbnailDataUrl = this.croppingImplementation.getCroppedDataUrl({width: 300});
    const thumbnailBlob = this.croppingImplementation.getCroppedBlob({width: 300});
    const thumbnailFile = this.croppingImplementation.getCroppedFile({width: 300});
    const croppedFile = this.croppingImplementation.getCroppedFile();
    this._resolvePromise({cropData, thumbnailDataUrl, thumbnailBlob, thumbnailFile, croppedFile, cancelled: false});
  }

  _resolvePromiseWithCancelled () {
    this._resolvePromise({cancelled: true});
  }

  _resolvePromiseWithOriginalData () {
    const cropData = this.previousCropData;
    this._resolvePromise({cropData, cancelled: false});
  }

  _removeCropperFromDocument () {
    this.baseElement.parentElement!.removeChild(this.baseElement);
    document.body.className = document.body.className.replace(' __cropModalOpen', '');
  }

  _createModal () {
    if (this.baseElement) return;
    const div = document.createElement('div') as HTMLDivElement;
    div.setAttribute('class', 'frixxerAdminClient-ImageCropper');

    return this.elements.baseElement = this.baseElement = div;
  }

  _addCancelButton (elementToAddTo: HTMLElement) {
    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.innerHTML = 'Cancel';
    button.addEventListener('click', this._cancel) // TODO: remove memory leak
    elementToAddTo.appendChild(button);
    return button;
  }

  _addCropButton (elementToAddTo: HTMLElement) {
    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.innerHTML = 'Crop';
    button.addEventListener('click', this._confirmCrop) // TODO: remove memory leak
    elementToAddTo.appendChild(button);
    return button;
  }

  _setIncomingImageElement (imageElement: HTMLImageElement) {
    this.imageElement = imageElement;
  }

  _setIncomingImageBlob (blob: Blob) {
    this.originalBlob = blob;
  }

  _prepareInitialImage () {
    return new Promise((resolve, reject) => {
      const div = document.createElement('div');
      const img: HTMLImageElement = document.createElement('img');
      this.elements.image = img;
      this.elements.container = div;
      div.id = 'cropperContainer';
      // img.id = 'theImageCropperImage';
      div.appendChild(img);
      this._getOriginalSrc().then(dataUrlOrUri => {
        img.onload = () => {
          this._setOriginalWidthAndHeight(img)
          resolve(div);
        }
        img.src = dataUrlOrUri;
      });
      this.baseElement.appendChild(div);
    });
  }

  _setOriginalWidthAndHeight (img: HTMLImageElement) {
    this.originalWidth = img.naturalWidth;
    this.originalHeight = img.naturalHeight;
  }

  _getOriginalWidthAndHeight () {
    const {originalWidth, originalHeight} = this;
    return {width: originalWidth, height: originalHeight};
  }

  _prepareCropper () {
    this._prepareInitialImage()
    .then(preparedDiv => {
      let image = this.elements.image;
      // TODO: Fix this hack.
      // The reason for this is because we are loading CropperJS in a modal, and
      // the modal need to have fully loaded first.
      setTimeout(() => {
        this.croppingImplementation = new CroppingImplementation(image, {aspectRatio: 16/9, initialCropData: this.previousCropData});
        // this.croppingImplementation.logActiveData();
        this._addCancelButton(this.baseElement);
        this._addCropButton(this.baseElement);
      }, 200);
    });
  }

  _getOriginalSrc(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.originalBlob) {
        blobToDataURL(this._getIncomingImageBlob()).then(resolve);
      } else if (this.imageElement) {
        resolve(this.imageElement.src);
      } else {
        reject(new Error('neither image source or blob were present'));
      }
    });
  }

  _getIncomingImageBlob () {
    return this.originalBlob;
  }

  cropBlob(originalBlob: Blob, previousCropData?: object): Promise<CroppedFileData> {
    const promise = this._createCropperPromise();
    this._setIncomingImageBlob(originalBlob);
    this._createAndDisplayUI(previousCropData);
    return promise;
  }

  cropImage(imageElement: HTMLImageElement, previousCropData?: object): Promise<CroppedFileData> {
    const promise = this._createCropperPromise();
    this._setIncomingImageElement(imageElement);
    this._createAndDisplayUI(previousCropData);
    return promise;
  }

  _createAndDisplayUI (previousCropData?: object) {
    this._setPreviousCropData(previousCropData);
    this._prepareCropper();
    this._displayUserInterface();
  }

  _createCropperPromise (): Promise<any> {
    return new Promise((resolve, reject) => {
      this._resolvePromise = resolve as ImageCropper['_resolvePromise'];
      this._rejectPromise = reject;
    })
  }

  _setPreviousCropData (previousCropData?: object) {
    this.previousCropData = previousCropData ? previousCropData : {x: 0, y: 0, zoom: 1};
  }

  _displayUserInterface () {
    this._createModal(); // just in case?
    document.body.appendChild(this.baseElement);
    document.body.className += ' __cropModalOpen';
  }

}

export default ImageCropper;
