import { Injectable } from '@angular/core';
import { AService } from 'app/shared-services/api/aservice.service';
import { HttpService } from 'app/shared-services/http.service';
import { SpinnerService } from 'app/shared-modules/spinner-module/spinner.service';

@Injectable()
export class IcoPackageService extends AService{

  constructor(http: HttpService, spinnerService: SpinnerService) { 
    super('ico-package', http, spinnerService);
  }

  confirm(arr: number[]) {
    return this.http.post(`${this.resource}/confirm`, arr).toPromise();
  }

  reject(arr: number[]) {
    return this.http.post(`${this.resource}/reject`, arr).toPromise();
  }

  manualCreate(user_id: number, ico_package: number, otp_code: string) {
    return this.http.post(`${this.resource}/manual-create`, {user_id, ico_package, otp_code}).toPromise();
  }

}
