import * as React from 'react';
import './FileUploadButton.scss';

export type BeforeUploadObject = {file: File, cancelled?: false }
  | {file?: File, cancelled: true};

export type BeforeUploadHandler = (beforeUploadObject: BeforeUploadObject) => Promise<BeforeUploadObject>;

export type UploadHandler = (file: File) => Promise<FileUploadData>;

export interface FileUploadBaseProps {
  accept?: string,
  beforeUpload?: BeforeUploadHandler
}

export interface FileUploadProps extends FileUploadBaseProps {
  uploadFunction: UploadHandler
}

interface S {
  chosenFile?: File,
  awaitingResponse: boolean
}

class FileUploadButtonComponent extends React.Component<FileUploadProps, S> implements React.Component {

  public static defaultProps: Partial<FileUploadProps> = {
    beforeUpload: (beforeUploadObject: BeforeUploadObject) => Promise.resolve(beforeUploadObject),
  }

  constructor(props: FileUploadProps) {
    super(props)
    this.state = {
      awaitingResponse: false
    }

    this.createAndInvokeFileSelector = this.createAndInvokeFileSelector.bind(this);
  }



  // @ViewChild('cropper') cropper;
  // @Output() uploadComplete = new EventEmitter();
  // @Input('button-text') buttonText: string
  // @Input() accept?: string
  // @Input() beforeUpload?: BeforeUploadHandler

  onClick(e: MouseEvent) {
    this.createAndInvokeFileSelector();
  }

  createAndInvokeFileSelector() {
    const input = document.createElement('input') as HTMLInputElement;
    input.type = 'file';
    if (this.props.accept) {
      input.accept = this.props.accept;
    }
    input.setAttribute('style', 'display:none;');
    input.onchange = (event: FileChangeEvent) => {
      this.handleChosenFileChange(event);
      document.body.removeChild(input);
    };
    document.body.appendChild(input);
    input.click();
  }

  handleChosenFileChange(changeEvent: FileChangeEvent) {
    this.setRequestPending();
    const file = changeEvent.target.files[0];
    const uploadPromise = this.props.beforeUpload!({file})
    .then(cropData => {
      this.setRequestComplete();
      if (cropData.cancelled) {
        // this.uploadComplete.emit({type: 'upload cancelled', data: null})
      } else {
        this.uploadFile(cropData.file).then(this.handleUploadResponse.bind(this))
      }
    });
  }

  setRequestComplete(): void {
    this.setState({awaitingResponse :false});
  }

  setRequestPending(): void {
    this.setState({awaitingResponse: true});
  }

  uploadFile(file: File) {
    return this.props.uploadFunction!(file);
  }

  handleUploadResponse(fileUploadResolved: FileUploadData|Error): void {
    if (fileUploadResolved instanceof Error) {
      // this.uploadComplete.emit({type: 'file upload failure', data: fileUploadResolved })
    } else {
      // this.uploadComplete.emit({type: 'file uploaded', data: fileUploadResolved})
    }
  }

  render() {
    return <button className="reactBasicTemplateEditor-FileUploadButton"
      type="button" onClick={this.createAndInvokeFileSelector}>{ this.props.children }</button>;
  }

}

export default FileUploadButtonComponent;
