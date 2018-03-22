import { Injectable } from '@angular/core'
import { AService } from './aservice.service'
import {HttpService} from "../http.service"


@Injectable()
export class ProductService extends AService {
  constructor(http: HttpService) {
    super('product', http);    
  }
}


@Injectable()
export class ProductCategoryService extends AService {
  constructor(http: HttpService) {
    super('product-category', http);    
  }
}