import { Injectable } from '@angular/core';
import { UploadService } from './aupload.service'
import { HttpService } from '../http.service'

@Injectable()
export class ImageService extends UploadService{

  constructor(http: HttpService) {
    super('image', http);
  }  

}
