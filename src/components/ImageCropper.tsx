import * as React from 'react';
import CroppingImplementation from './lib/wrappers/CroppingImplementation';
import Deferred from './lib/deferred';
import Modal from './lib/Modal';
import { blobToDataURL, DATA_URL_MIME_MATCHER } from './lib/fileManipulation';

function temporarilyAddStylesUntilCssFilesExist () {
  const styleId = 'temporaryImageCropperStyles';
  if (document.querySelector(`#${styleId}`)) return;
  const styles = document.createElement('style');
  styles.setAttribute('id', styleId);
  styles.innerHTML = `
    .reactBasicTemplateEditor-ImageCropper {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: white;
      overflow: auto;
      z-index: 1000;
    }

    .reactBasicTemplateEditor-ImageCropper img {
      max-width: 100%;
    }

    #cropperContainer {
      max-width: 100%;
    }

  `;

  document.body.appendChild(styles);
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
  onCroppingBegin?: OnCroppingBeginHandler
  onCroppingComplete?: (data: CroppedFileData) => void
}

interface S {
  imageUri: string,
  imageReady: boolean,
  croppingComplete: boolean
}

class ImageCropper extends React.Component<P, S> {
  cropDeferred: Deferred<CroppedFileData>
  croppingImplementation: CroppingImplementation

  constructor(props: P) {
    super(props);
    this.state = {
      imageUri: '',
      imageReady: false,
      croppingComplete: false
    }

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
    this.getSrc().then(() => {
      this.setState({imageReady: true})
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
      this.cropDeferred = new Deferred();
      this.croppingImplementation = new CroppingImplementation(el, {aspectRatio: 16/9});
      if (this.props.onCroppingBegin) {
        this.props.onCroppingBegin(this.cropDeferred.getPromise());
      }
    }
  }

  closeModal() {
    this.setState({croppingComplete: true});
  }

  handleCancel() {
    const cancelled = {cancelled: true as true};
    if (this.cropDeferred) {
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
      cancelled: false,
      croppedFile: this.croppingImplementation.getCroppedFile()
    }
  }

  handleCrop() {
    this.cropDeferred.resolve(this.getCropData())
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
        <div className="reactBasicTemplateEditor-ImageCropper-cropperContainer">
          <img ref={(el) => this.initCropper(el)} src={this.state.imageUri} />
        </div>
        <button onClick={this.handleCancel} type="button">Cancel</button>
        <button onClick={this.handleCrop} type="button">Crop</button>
      </Modal>
    );
  }

}

export default ImageCropper;
