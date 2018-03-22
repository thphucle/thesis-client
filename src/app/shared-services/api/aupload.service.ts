import { Injectable } from '@angular/core';
import { AService } from './aservice.service'
import { HttpService } from '../http.service'

export class UploadService extends AService {  
  constructor(resource: string, http: HttpService) {    
    super(resource, http);
  }

  create(file:File | Array<File>) {        
    return this.http.postForm(`${this.resource}`, this.createFormData(file)).toPromise();           
  }

  update(id:number | string, formData: FormData) {
    return this.http.putForm(`${this.resource}/${id}`, formData).toPromise();
  }
  

  private createFormData(file:File | Array<File>): FormData {
    
    let files: Array<File>;
    if (!Array.isArray(file)) {
      files = [file];
    } else {
      files = <Array<File>>file;
    }    
    
    let formData: FormData = new FormData();    
    files.forEach(file => formData.append('uploads[]', file));    
    return formData;
  }


}
