import * as React from 'react';
import FileUploadButton, {FileUploadProps} from './FileUploadButton';

interface P extends FileUploadProps {
  cropImage?: boolean
}

class ImageUploadButton extends React.Component<P> {
  public static defaultProps: Partial<P> = {
    beforeUpload: file => Promise.resolve(file),
    accept: 'image/jpeg,image/png',
    cropImage: true
  }

  constructor(props: P) {
    super(props);
    this.state = {
      something: 'ele'
    }

    this.handleBeforeUpload = this.handleBeforeUpload.bind(this);
  }

  handleBeforeUpload(file: File): Promise<File> {
    return this.props.beforeUpload!(file);
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
