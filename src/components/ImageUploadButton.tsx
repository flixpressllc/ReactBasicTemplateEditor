import * as React from 'react';
import FileUploadButton, {FileUploadBaseProps, BeforeUploadObject, UploadHandler} from './FileUploadButton';
import ImageCropper, { CroppedFileData, OnCroppingBeginHandler } from './ImageCropper';
import { uploadImageToServerAndGetNewName } from '../utils/ajax';
import * as ImageBankActions from '../actions/ImageBankActions';

interface P extends FileUploadBaseProps {
  cropImage?: boolean
  uploadFunction?: UploadHandler
}

interface S {
  fileToCrop: File|false
}

class ImageUploadButton extends React.Component<P, S> {
  public static defaultProps: Partial<P> = {
    beforeUpload: beforeUploadObject => Promise.resolve(beforeUploadObject),
    accept: 'image/jpeg,image/png',
    uploadFunction: uploadImageToServerAndGetNewName,
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

  cropImageFile(file: File): Promise<BeforeUploadObject> {
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

  optionallyCropImage(file: File): Promise<BeforeUploadObject> {
    if (!this.props.cropImage) return Promise.resolve({file});
    return this.cropImageFile(file)
      .then(cropData => {
        this.setState({fileToCrop: false});
        return cropData;
      });
  }

  handleBeforeUpload(buObject: BeforeUploadObject): Promise<BeforeUploadObject> {
      if (!buObject.cancelled) {
        return this.optionallyCropImage(buObject.file)
          .then(this.props.beforeUpload!.bind(this));
      } else {
        return Promise.resolve(buObject);
      }
  }

  handleUpload(file: File) {
    return uploadImageToServerAndGetNewName(file)
      .then(response => {
        ImageBankActions.addImagesToBank([response])
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
