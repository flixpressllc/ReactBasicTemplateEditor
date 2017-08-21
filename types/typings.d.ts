type FileUploadData = any;
type FileUploadResponse = any;
interface FileChangeEvent extends Event {
  target: Event['target'] & {files: File[]}
}
