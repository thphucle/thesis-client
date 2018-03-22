import { Injectable } from '@angular/core';
import { AService } from 'app/shared-services/api/aservice.service';
import { HttpService } from 'app/shared-services/http.service';

@Injectable()
export class IdentityRequestService extends AService{

  constructor(http: HttpService) { 
    super('identity-request', http);
  }

  myIdentityRequest(user_id: number) {
    return this.http.get(`${this.resource}`, {user_id}).toPromise();
  }

  reject(id: number, note: string) {
    return this.http.post(`${this.resource}/reject`, {id, note}).toPromise();
  }

  verify(id: number) {
    return this.http.post(`${this.resource}/verify`, {id}).toPromise();
  }
}
