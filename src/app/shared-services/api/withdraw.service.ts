import { Injectable } from '@angular/core';
import { AService } from 'app/shared-services/api/aservice.service';
import { HttpService } from 'app/shared-services/http.service';
import { SpinnerService } from 'app/shared-modules/spinner-module/spinner.service';
import { WalletName } from 'app/shared-services/api/commission.service';

@Injectable()
export class WithdrawService extends AService {
  constructor(http: HttpService, spinnerService: SpinnerService) {
    super('withdraw', http, spinnerService);
  }

  complete(ids: number[], wallet_name: WalletName | string) {
    return this.http.post(`${this.resource}/complete`, {ids, wallet_name}).toPromise();
  }
}