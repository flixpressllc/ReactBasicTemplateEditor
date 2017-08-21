import * as Cropper from 'cropperjs';
import { dataURLtoBlob, dataURLtoFile, getMimeTypeFromDataUrl, getExtensionForMimeType, mimeTypeForExtension } from '../fileManipulation';
import { traverseObject } from 'happy-helpers';

const PRECISION = 5;

type CropData = {
  x: number
  y: number
  zoom: number
}

function truncateNumberAtProperPrecision (number: number) {
  return parseFloat(number.toFixed(PRECISION));
}

function findPercentFromMagnitudes (magA: number, magB: number, magOffOrigin: number) {
  return (magOffOrigin - ((magA - magB) / 2)) * (100 / magA);
}

function findMagnitudeOffOrigin (magA: number, magB: number, percentFromCenter: number) {
  return ((magA - magB) / 2) + ((magA / 100) * percentFromCenter);
}

function createDeferred () {
  let resolve;
  let reject;
  let deferred: any = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  })
  deferred.resolve = resolve;
  deferred.reject = reject;
  return deferred;
}

export default class CroppingImplementation {
  whenReady: any;
  croppingTool: Cropper;
  imageMimeType: string;
  imageElement: HTMLImageElement;

  constructor (imageElement: HTMLImageElement, options?: any) {
    this.whenReady = createDeferred();
    this.imageElement = imageElement;
    const {
      aspectRatio,
      initialCropData,
      cropAndReturnBlob,
    } = options;

    /*
      view modes from the documentation:
      0: the crop box is just within the container
      1: the crop box should be within the canvas
      2: the canvas should not be within the container
      3: the container should be within the canvas
    */
    const settings = {
      viewMode: 1,
      dragMode: 'none',
      guides: false,
      autoCropArea: 0.9,
      aspectRatio,
      rotatable: false,
      // scalable: false,
      responsive: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      zoomable: true,
      zoomOnWheel: false,
      zoomOnTouch: false,
      crop: (e: any) => this.getCropData(),
      ready: () => this.whenReady.resolve()
    }

    this.croppingTool = new Cropper(imageElement, settings);
    this.whenReady.then(() => this.setInitialCrop());
    // window.cropper = this.croppingTool;
  }

  getCropData (): CropData {
    const data = this._calculateCropdata();

    let finalObject = {
      x: data.xPercent,
      y: data.yPercent,
      zoom: data.zoomPercent
    }

    return traverseObject(finalObject, (k: string, v: number) => {
      return [k, truncateNumberAtProperPrecision(v)]
    })
  }

  setInitialCrop () {
    const cropper = this.croppingTool;
    cropper.zoomTo(0); // smallest posssible zoom.
    const containerWidth = cropper.getContainerData().width;
    const canvasData = cropper.getCanvasData();
    const canvasWidth = canvasData.width;
    const newLeftOffset = (containerWidth - canvasWidth) / 2;
    const newData = Object.assign({}, canvasData, {left: newLeftOffset})
    cropper.setCanvasData(newData);
  }

  getCroppedBlob (options?: any) {
    return dataURLtoBlob(this.getCroppedDataUrl(options));
  }

  getCroppedFile (options?: any) {
    const ext = this._getImageExtension();
    let file = dataURLtoFile(this.getCroppedDataUrl(options), `unnamed.${ext}`);
    return file;
  }

  getCroppedDataUrl (options?: any) {
    // options are width, or height. See https://github.com/fengyuanchen/cropperjs#getcroppedcanvasoptions
    const mime = this._getImageMimeType();
    return this.croppingTool.getCroppedCanvas(options).toDataURL(mime, 0.7);
  }

  _getImageMimeType () {
    if (this.imageMimeType) return this.imageMimeType;
    const ENDS_IN_DOT_AND_THREE_LETTERS = /\.([A-Za-z]{3})$/;
    let possibleMatch = this.imageElement.src.match(ENDS_IN_DOT_AND_THREE_LETTERS);
    let mime;
    if (possibleMatch) {
      mime = mimeTypeForExtension(possibleMatch[1]);
    } else {
      mime = getMimeTypeFromDataUrl(this.imageElement.src);
    }
    this.imageMimeType = mime;
    return mime;
  }

  _getMimeTypeFromExtension (fileName: string) {
    const ext = fileName.slice(fileName.lastIndexOf('.'));
    return mimeTypeForExtension(ext);
  }

  _getImageExtension () {
    return getExtensionForMimeType(this._getImageMimeType());
  }

  _calculateCropdata () {
    // TODO: replace all this garbage with my nice, new functions up top.
    let canvas = this.croppingTool.getCanvasData();
    let cBox = this.croppingTool.getCropBoxData();
    let iData = this.croppingTool.getImageData();
    let cropperjsData = this.croppingTool.getData();
    let offsetX = cBox.left - canvas.left;
    let wFull = canvas.width;
    let wCropped = cBox.width;
    let xOffsetAtCenter = (wFull - wCropped) / 2;
    let xPercent = (offsetX - xOffsetAtCenter) / wFull;
    let offsetY = cBox.top - canvas.top;
    let hFull = canvas.height;
    let hCropped = cBox.height;
    let yOffsetAtCenter = (hFull - hCropped) / 2
    let yPercent = (offsetY - yOffsetAtCenter) / hFull;
    let xPixelsRemainingAsPercentOfOriginal = iData.width / cBox.width;
    let yPixelsRemainingAsPercentOfOriginal = iData.height / cBox.height;
    let zoomPercent = Math.min(xPixelsRemainingAsPercentOfOriginal, yPixelsRemainingAsPercentOfOriginal);
    return {
      canvas, cBox, iData, cropperjsData, offsetX, wFull, wCropped,
      xOffsetAtCenter, xPercent, offsetY, hFull, hCropped, yOffsetAtCenter,
      yPercent, xPixelsRemainingAsPercentOfOriginal,
      yPixelsRemainingAsPercentOfOriginal, zoomPercent }
  }

  logActiveData () {
    this.imageElement.addEventListener('crop', e => {
      const data = this._calculateCropdata();
      let consoleLog = `==================================
      getData x       ${data.cropperjsData.x}
      offset x        ${data.offsetX}
      image left:     ${data.iData.left}
      cropBox left    ${data.cBox.left}
      canvas left     ${data.canvas.left}
      image width:    ${data.iData.width}
      cropBox width   ${data.cBox.width}
      getData width   ${data.cropperjsData.width}
      canvas width    ${data.canvas.width}
      canvas left     ${data.canvas.left}
      x at center     ${data.xOffsetAtCenter}
      x offset %      ${data.xPercent}
      y offset %      ${data.yPercent}
      zoomPercent     ${data.zoomPercent}
      `;
      console.log(consoleLog);
    })
    return this;
  }

}
