type FileUploadData = any;
type FileUploadResponse = any;

interface FileChangeEvent extends Event {
  target: Event['target'] & {files: File[]}
}

// Fix for bad TS typing for FileReader types
interface FileReaderEventTarget extends EventTarget {
  result:string
}

interface FileReaderEvent extends Event {
  target: FileReaderEventTarget;
  getMessage():string;
}
// end fix

interface EmittedEvent {
  data: any;
  type: string;
}

// Declared modules
declare module 'happy-helpers';
