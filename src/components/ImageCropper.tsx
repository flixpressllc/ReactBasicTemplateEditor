import * as React from 'react';
import CroppingImplementation from './lib/wrappers/CroppingImplementation';
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

type CroppedFileData = {
  cropData?: object,
  thumbnailDataUrl?: string,
  thumbnailBlob?: Blob,
  thumbnailFile?: File,
  croppedFile?: File,
  cancelled: boolean
}

interface P {
  imageToCrop?: HTMLImageElement
  blobToCrop?: Blob
  onCroppingComplete: (data: CroppedFileData) => void
}

interface S {
  imageUri: string,
  imageReady: boolean
}

class ImageCropper extends React.Component<P, S> {
  constructor(props: P) {
    super(props);
    this.state = {
      imageUri: '',
      imageReady: false
    }
  }

  private hasImageToCrop() {
    return !(this.props.imageToCrop === undefined && this.props.blobToCrop === undefined)
  }

  private modalIsOpen() {
    return this.hasImageToCrop() && this.state.imageReady;
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
      new CroppingImplementation(el, {aspectRatio: 16/9});
    }
  }

  render() {
    if (this.hasImageToCrop()) {
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
      </Modal>
    );
  }

}

export default ImageCropper;
