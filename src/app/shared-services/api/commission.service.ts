import { Injectable } from '@angular/core';
import {HttpService} from "../http.service";
import 'rxjs/add/operator/toPromise';
import { AService } from "app/shared-services/api/aservice.service";
import { SpinnerService } from 'app/shared-modules/spinner-module/spinner.service';
import utils from 'app/shared-classes/utils';

@Injectable()
export class CommissionService extends AService {

  constructor(http:HttpService, spinnerService: SpinnerService) {
    super('commission', http, spinnerService);
  }

}

@Injectable()
export class TokenService extends AService {
  constructor(http: HttpService, spinnerService: SpinnerService) {
    super('token', http, spinnerService);
  }

  manualCreate(user_id: number, amount: number, wallet_name: string, otp_code: string) {
    return this.http.post(`${this.resource}/manual-create`, {user_id, amount, otp_code, wallet_name}).toPromise();
  }
}


export enum WalletName {
  BTC = 'btc',
  USD_1 = 'usd1',
  USD_2 = 'usd2',
  CTU_1 = 'ctu1',
  CTU_2 = 'ctu2',
  CTU_3 = 'ctu3'
};

@Injectable()
export class WalletService extends AService {
  constructor(http: HttpService, spinnerService: SpinnerService) {    
    super('wallet', http, spinnerService);
  }

  getBalance(user_id?:number, wallet_name?: WalletName) {    
    let params:any = {
      user_id,
      wallet_name
    };    

    let url = `${this.resource}/balance?${utils.toQueryString(params)}`;

    return this.http.get(url).toPromise();
  }

  manualUpdateWallet(wallet_name: WalletName, amount: number, otp_code: string, user_id?:number, type?:string) {
    let url = `${this.resource}/manual-update-wallet`;
    let body = {
      wallet_name,
      user_id,
      amount,
      otp_code,
      type
    };

    return this.http.post(url, body).toPromise();
  }

  transfer(data: {from_wallet: WalletName, amount: number, to_useranme: string, otp_code: string}) {
    let url = `${this.resource}/transfer`;
    return this.http.post(url, data).toPromise();
  }

  getLimit() {
    let url = `${this.resource}/limit`;
    return this.http.get(url).toPromise();
  }

  
}