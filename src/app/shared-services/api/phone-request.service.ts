import {Injectable} from '@angular/core';
import {HttpService} from "../http.service";
import 'rxjs/add/operator/toPromise';
import { AService } from 'app/shared-services/api/aservice.service';

@Injectable()
export class PhoneRequestService extends AService {

  constructor(
    http: HttpService
  ) {
    super('phone-request', http);
  }

  sendCode(phone: string) {
    return this.http.post('phone-request', {phone}).toPromise();
  }

  generateOtp() {
    return this.http.get(`phone-request/generate-otp`).toPromise();
  }

  verifyOtp(otp_code: string) {
    return this.http.post(`${this.resource}/verify-otp`, {otp_code}).toPromise();
  }
} 