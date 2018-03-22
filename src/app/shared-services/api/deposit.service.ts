import { Injectable } from '@angular/core';
import { AService } from 'app/shared-services/api/aservice.service';
import { HttpService } from 'app/shared-services/http.service';
import { SpinnerService } from 'app/shared-modules/spinner-module/spinner.service';

@Injectable()
export class DepositService extends AService {
  constructor(http: HttpService, spinnerService: SpinnerService) {
    super('deposit', http, spinnerService);
  }

}