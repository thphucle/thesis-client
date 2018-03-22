import { Component, OnInit, Input, EventEmitter, Output, forwardRef, ElementRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ImageService } from "app/shared-services/api/image.service";


@Component({
  selector: 'app-summernote-editor',
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SummernoteEditorComponent), multi: true}
  ],
  template: `
    <div class="summernote"></div>
  `,
  styles: []
})

export class SummernoteEditorComponent implements OnInit, ControlValueAccessor{
  propagateChange: (_:any) => {};

  private _contentHtml: string = '';
  private _options:any = {};
  private _editor:any;
  
  defaultOptions:any = {
    minHeight: 300,
    maxHeight: 500,
    imageUploadSize: 'medium'    
  };  

  @Input('options') set options(value:any) {    
    if (!value) return;
    let finalOptions = Object.assign(
      this.defaultOptions,             
      value
    );
    this._options = finalOptions;
    this.init(this._options);
  }  

  @Input() set value(value: string) {
    if (this._contentHtml == value) return;
    this._contentHtml = value;
    if(this._editor) {
      this.setContentEditor(this._contentHtml);
    }
  }

  @Output() change = new EventEmitter<any>();

  get value() {
    return this._contentHtml;
  }
  
  constructor(
    private element: ElementRef,
    private imageService: ImageService
  ) { 
    this.defaultOptions.callbacks = {
      onImageUpload: (files) => {
        this.uploadImage(files, this._editor);
      },
      onChange: (contents) => {
        this.onChangeCallback(contents);
      }
    }

    this.options = {};
  }

  ngOnInit() {
    this.init(this.defaultOptions);    
  }

  private init(options:object) {
    let archorElement = $(this.element.nativeElement).find('.summernote');    
    archorElement.summernote('destroy');    
    let editor = archorElement.summernote(options);
    this._editor = editor;
    this.setContentEditor(this._contentHtml);
  }

  onChangeCallback(contents) {
    this._contentHtml = contents;
    this.change.emit(this._contentHtml);
    if (this.propagateChange) {      
      this.propagateChange(this._contentHtml);
    }
  }

  writeValue(value: any) {
    this._contentHtml = value;
    this.setContentEditor(this._contentHtml);
  }

  registerOnChange(fn) {    
    this.propagateChange = fn;
  }

  registerOnTouched() {}

  private setContentEditor(value:string) {
    this._editor.summernote('code', value);
  }
  private async uploadImage(files: File[], editor:any) {
    if (!files.length) return;
    let file = files[0];
    let resp = await this.imageService.create(file);
    if (resp.error) {
      return toastr.error('Upload image failed', resp.error.message);
    }

    let image = resp.data[0];
    let imageUrl = image[this._options.imageUploadSize];
    if (!imageUrl) return console.error(`Not found image size ${this._options.imageUploadSize}`);

    editor.summernote('insertImage', imageUrl);
  }
}
