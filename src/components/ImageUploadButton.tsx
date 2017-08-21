import * as React from 'react';
import FileUploadButton, {FileUploadProps, BeforeUploadHandlerReturn} from './FileUploadButton';
import ImageCropper from './lib/ImageCropperComponent';

interface P extends FileUploadProps {
  cropImage?: boolean
}

class ImageUploadButton extends React.Component<P, {}> {
  public static defaultProps: Partial<P> = {
    beforeUpload: file => Promise.resolve({file}),
    accept: 'image/jpeg,image/png',
    cropImage: true
  }

  constructor(props: P) {
    super(props);

    this.handleBeforeUpload = this.handleBeforeUpload.bind(this);
  }

  cropImageFile(file: File): BeforeUploadHandlerReturn {
    return new Promise((resolve, reject) => {
      const ic = new ImageCropper();
      ic.cropBlob(file).then(data => {
        if (data.cancelled) {
          resolve({cancelled: true})
        } else if (data.croppedFile) {
          resolve({file: data.croppedFile});
        } else {
          reject(`The cropper failed.`);
        }
      })
    })
  }

  optionallyCropImage(file: File): BeforeUploadHandlerReturn {
    if (!this.props.cropImage) return Promise.resolve({file});
    return this.cropImageFile(file);
  }

  handleBeforeUpload(file: File): BeforeUploadHandlerReturn {
      return this.optionallyCropImage(file)
        .then(this.props.beforeUpload!.bind(this));
  }

  render() {
    return (
      <FileUploadButton
        accept="image/jpeg,image/png"
        {...this.props}
        beforeUpload={ this.handleBeforeUpload }>
        { this.props.children }
      </FileUploadButton>
    );
  }

}

export default ImageUploadButton;
