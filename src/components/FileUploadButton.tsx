import * as React from 'react';

class UploadFileService {
  uploadFile(file: File): Promise<FileUploadResponse> {
    return new Promise(resolve => {
      setTimeout(() => resolve('[{"things": "were uploaded"}]'),2000);
    })
  }
}


export type BeforeUploadHandlerReturn = Promise<
  {file: File, cancelled?: false } | {file?: File, cancelled: true}
>;

export type BeforeUploadHandler = (file: File) => BeforeUploadHandlerReturn;

export interface FileUploadProps {
  accept?: string,
  beforeUpload?: BeforeUploadHandler
}

interface S {
  chosenFile?: File,
  awaitingResponse: boolean
}

class FileUploadButtonComponent extends React.Component<FileUploadProps, S> implements React.Component {
  uploadFileService = new UploadFileService();

  public static defaultProps: Partial<FileUploadProps> = {
    beforeUpload: (file: File) => Promise.resolve({file})
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
    const chosenFile = changeEvent.target.files[0];
    const uploadPromise = this.props.beforeUpload!(chosenFile)
    .then(beforeUploadReturn => {
      this.setRequestComplete();
      if (beforeUploadReturn.cancelled) {
        // this.uploadComplete.emit({type: 'upload cancelled', data: null})
      } else {
        this.uploadFile(beforeUploadReturn.file).then(this.handleUploadResponse.bind(this))
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
    return this.uploadFileService.uploadFile(file);
  }

  handleUploadResponse(fileUploadResolved: FileUploadData|Error): void {
    if (fileUploadResolved instanceof Error) {
      // this.uploadComplete.emit({type: 'file upload failure', data: fileUploadResolved })
    } else {
      // this.uploadComplete.emit({type: 'file uploaded', data: fileUploadResolved})
    }
  }

  render() {
    return <button type="button" onClick={this.createAndInvokeFileSelector}>{ this.props.children }</button>;
  }

}

export default FileUploadButtonComponent;
