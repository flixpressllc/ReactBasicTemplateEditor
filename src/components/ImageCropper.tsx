import * as React from 'react';
import CroppingImplementation from './lib/wrappers/CroppingImplementation';
import Deferred from './lib/deferred';
import Modal from './lib/Modal';
import { blobToDataURL, DATA_URL_MIME_MATCHER } from './lib/fileManipulation';
import './ImageCropper.scss';

function temporarilyAddStylesUntilCssFilesExist () {
  const styleId = 'temporaryImageCropperStyles';
  if (document.querySelector(`#${styleId}`)) return;
  const linkToCropperCss = document.createElement('link');
  linkToCropperCss.setAttribute('rel', 'stylesheet');
  linkToCropperCss.setAttribute('href', 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/0.8.1/cropper.min.css');
  document.head.appendChild(linkToCropperCss);
}

export type CroppedFileData = {
  cropData?: object,
  thumbnailDataUrl?: string,
  thumbnailBlob?: Blob,
  thumbnailFile?: File,
  croppedFile?: File,
  cancelled: true
} | {
  cropData?: object,
  thumbnailDataUrl?: string,
  thumbnailBlob?: Blob,
  thumbnailFile?: File,
  croppedFile: File,
  cancelled?: false
}

export type OnCroppingBeginHandler = (promise: Promise<CroppedFileData>) => void

interface P {
  imageToCrop?: HTMLImageElement
  blobToCrop?: Blob
  cancelText?: string
  cropText?: string
  onCroppingBegin?: OnCroppingBeginHandler
  onCroppingComplete?: (data: CroppedFileData) => void
}

interface S {
  imageUri: string,
  imageReady: boolean,
  croppingComplete: boolean,
  cropperInitialized: boolean
}

class ImageCropper extends React.Component<P, S> {
  cropDeferred: Deferred<CroppedFileData>
  croppingImplementation: CroppingImplementation

  public static defaultProps: Partial<P> = {
    cancelText: 'Cancel',
    cropText: 'Crop'
  }

  constructor(props: P) {
    super(props);
    this.state = {
      imageUri: '',
      imageReady: false,
      croppingComplete: false,
      cropperInitialized: false
    }
    temporarilyAddStylesUntilCssFilesExist();
    this.handleCrop = this.handleCrop.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  private hasImageToCrop() {
    return !(this.props.imageToCrop === undefined && this.props.blobToCrop === undefined)
  }

  private modalIsOpen() {
    return this.hasImageToCrop() && this.state.imageReady && !this.state.croppingComplete;
  }

  private setSrc() {
    this.getSrc().then((uri: string) => {
      this.setState({imageReady: true, imageUri: uri})
    })
  }

  private getSrc(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.state.imageUri !== '') {
        resolve(this.state.imageUri)
      } else if (this.props.blobToCrop) {
        blobToDataURL(this.props.blobToCrop).then(resolve);
      } else if (this.props.imageToCrop) {
        resolve(this.props.imageToCrop.src);
      } else {
        reject(new Error('neither image source or blob were present'));
      }
    });
  }

  private initCropper(el: HTMLImageElement | null) {
    if (el === null) return;
    el.onload = () => {
      // setTimeout to ensure that the cropper doesn't overfill
      // the container it is in.
      setTimeout(() => {
        this.cropDeferred = new Deferred();
        this.croppingImplementation = new CroppingImplementation(el, {aspectRatio: 16/9});
        if (this.props.onCroppingBegin) {
          this.props.onCroppingBegin(this.cropDeferred.getPromise());
        }
        this.setState({cropperInitialized: true})
      },10)
    }
  }

  closeModal() {
    this.setState({croppingComplete: true});
  }

  handleCancel() {
    const cancelled = {cancelled: true as true};
    if (this.state.cropperInitialized) {
      // cropDeferred was defined
      //and onCroppingBegin was already called if it exists
      this.cropDeferred.resolve(cancelled);
    } else if (this.props.onCroppingBegin) {
      // onCroppingbegin was not already called, but it exists
      this.props.onCroppingBegin(Promise.resolve(cancelled))
    }
    this.closeModal();
  }

  getCropData(): CroppedFileData {
    return {
      croppedFile: this.croppingImplementation.getCroppedFile()
    }
  }

  handleCrop() {
    let cropData = this.getCropData();
    Object.assign(cropData, {cancelled: false});
    this.cropDeferred.resolve(cropData);
    this.closeModal();
  }

  render() {
    if (!this.hasImageToCrop()) {
      return null;
    }
    if (!this.state.imageReady) {
      this.setSrc();
    }
    return (
      <Modal
        isOpen={this.modalIsOpen()}
        contentLabel="Crop your image">
        <div className="reactBasicTemplateEditor-ImageCropper">
          <div className="reactBasicTemplateEditor-ImageCropper-cropperContainer">
            <img ref={(el) => this.initCropper(el)} src={this.state.imageUri} />
          </div>
          <button onClick={this.handleCancel} type="button">{ this.props.cancelText }</button>
          <button disabled={ !this.state.cropperInitialized } onClick={this.handleCrop} type="button">{ this.props.cropText }</button>
        </div>
      </Modal>
    );
  }

}

export default ImageCropper;
