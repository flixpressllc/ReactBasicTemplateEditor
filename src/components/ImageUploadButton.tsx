import * as React from 'react';
import FileUploadButton, {FileUploadProps, BeforeUploadHandlerReturn} from './FileUploadButton';
import ImageCropper, { CroppedFileData, OnCroppingBeginHandler } from './ImageCropper';
import { uploadImageToServer } from '../utils/ajax';
import * as ImageBankActions from '../actions/ImageBankActions';

interface P extends FileUploadProps {
  cropImage?: boolean
}

interface S {
  fileToCrop: File|false
}

class ImageUploadButton extends React.Component<P, S> {
  public static defaultProps: Partial<P> = {
    beforeUpload: file => Promise.resolve({file}),
    accept: 'image/jpeg,image/png',
    uploadFunction: uploadImageToServer,
    cropImage: true
  }

  handleCroppingBegin: OnCroppingBeginHandler = () => {throw new Error('should not have passed this function in. It should be overwritten below, then passed.')}

  constructor(props: P) {
    super(props);
    this.state = {
      fileToCrop: false
    }
    this.handleBeforeUpload = this.handleBeforeUpload.bind(this);
  }

  cropImageFile(file: File): BeforeUploadHandlerReturn {
    return new Promise((resolve, reject) => {
      this.handleCroppingBegin = (promise: Promise<CroppedFileData>) => {
        promise.then(croppedData => {
            if (croppedData.cancelled) {
              resolve({cancelled: true})
            } else if (croppedData.croppedFile) {
              resolve({file: croppedData.croppedFile});
            } else {
              reject(`The cropper failed.`);
            }
        })
      }
      this.setState({fileToCrop: file});
    })
  }

  optionallyCropImage(file: File): BeforeUploadHandlerReturn {
    if (!this.props.cropImage) return Promise.resolve({file});
    return this.cropImageFile(file)
      .then(cropData => {
        if (cropData.cancelled) {
          this.setState({fileToCrop: false})
        }
        return cropData;
      });
  }

  handleBeforeUpload(file: File): BeforeUploadHandlerReturn {
      return this.optionallyCropImage(file)
        .then(this.props.beforeUpload!.bind(this));
  }

  handleUpload(file: File): Promise<FileUploadResponse> {
    return uploadImageToServer(file)
      .then(response => {
        ImageBankActions.addImagesToBank(response)
        return response;
      })
  }

  renderImageCropper() {
    let imageCropper = null;
    if (this.state.fileToCrop) {
      imageCropper = (
        <ImageCropper
          onCroppingBegin={ this.handleCroppingBegin }
          cancelText="Cancel Upload"
          blobToCrop={ this.state.fileToCrop }/>
      );
    }

    return imageCropper;
  }

  render() {
    return (
      <FileUploadButton
        accept="image/jpeg,image/png"
        {...this.props}
        uploadFunction={ this.handleUpload }
        beforeUpload={ this.handleBeforeUpload }>

        { this.props.children }
        { this.renderImageCropper() }
      </FileUploadButton>
    );
  }

}

export default ImageUploadButton;
