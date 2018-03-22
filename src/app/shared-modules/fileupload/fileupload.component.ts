import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

export interface FileUploadItem {
  name: string
  url: string
  file?: File
  id?: number
  [key:string]: any
}

export type UploadApiFn = (f: FileUploadItem) => Promise<any>;

@Component({
  selector: 'app-fileupload',
  templateUrl: './fileupload.component.html',
  styleUrls: ['./fileupload.component.scss']
})
export class FileuploadComponent implements OnInit {
  @Input() allowExtensions: Array<string> = [];
  @Output() onRemove = new EventEmitter<any>();
  @Output() onAdd = new EventEmitter<any>();
  @Input() files: Array<FileUploadItem> = [];
  @Input() multiple = true;
  @Output() filesChange = new EventEmitter<Array<FileUploadItem>>();
  @Input() sizeLimit: number = 4036; //kb
  @Input() uploadFn: (f: FileUploadItem) => Promise<any>;
  @Input() textConfig = {
    button: 'Select Files',
    zone: 'Drop Files Here'
  };
  @Input() inline = false;


  private loadingFiles: Array<FileUploadItem> = [];
  private loadingFilesCount = 0;

  constructor() { }

  ngOnInit() {
  }

  fileSelectChange(event: EventTarget) {
    let eventObj: MSInputMethodContext = <MSInputMethodContext> event;
    let target: HTMLInputElement = <HTMLInputElement> eventObj.target;
    let selectedFiles: FileList = target.files;
    if (!selectedFiles.length) { return; }
    
    this.handleFilesChange(Array.from(selectedFiles));
    target.value = '';
  }

  dropFilesChange(files: File[]) {
    this.handleFilesChange(files);
  }

  private handleFilesChange(files: File[]) {
    let fileItems: Array<FileUploadItem> = Array.from(files).filter((f: File) => {
      return this.allowExtensions.indexOf(f.type.split('/')[1]) > -1 && f.size/1024 <= this.sizeLimit
    }).map((f: File) => {
      return {
        name: f.name,
        url: '',
        file: f
      };
    });

    this.loadingFiles = this.loadingFiles.concat(fileItems);    
    this.files = this.files.concat(this.loadingFiles);
    this.filesChange.emit(this.files);
    this.loadImages(this.loadingFiles);
  }

  private loadImage(fileItem: FileUploadItem) {
    let f = fileItem.file;
    let fr = new FileReader();
    fr.onload = (event:any ) => {
      let base64 = event.target.result;
      fileItem.url = base64;
      this.loadingFilesCount--;

      if (this.loadingFilesCount === 0) {
        console.log("Load files done");
        this.onAdd.emit(this.loadingFiles);
        this.loadingFiles = [];
      }
    }

    fr.readAsDataURL(f);
  }

  loadImages(files: Array<FileUploadItem>) {
    this.loadingFilesCount = files.length;
    files.forEach(f => {
      this.loadImage(f);
      if (this.uploadFn) {
        this.uploadImage(f);
      }
    });
  }

  uploadImage(f: FileUploadItem) {
    f._uploading = true;
    let promise = this.uploadFn(f);
    promise
    .then(() => {
      f._uploading = false;
    })
    .catch((err) => {
      f._uploading = false;
      f.error = 'Upload fail';
    });
  }

  removeItem(f: FileUploadItem, index: number) {
    this.files.splice(index, 1);
    this.onRemove.emit(f);
    this.filesChange.emit(this.files);
  }

}
