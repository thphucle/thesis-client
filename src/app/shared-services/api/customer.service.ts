import { Injectable } from '@angular/core';
import { AService } from "app/shared-services/api/aservice.service";
import { HttpService } from "app/shared-services/http.service";

@Injectable()
export class CustomerService extends AService{

  constructor(http: HttpService) { 
    super('mobile', http);
  }

}
