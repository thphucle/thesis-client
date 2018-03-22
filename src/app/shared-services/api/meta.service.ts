import {Injectable} from '@angular/core';
import {HttpService} from "../http.service";
import 'rxjs/add/operator/toPromise';
import { AService } from 'app/shared-services/api/aservice.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class MetaService extends AService{

  private countDownIntervalId;
  private openTime;
  private icoOpenTimeSub = new BehaviorSubject(undefined);
  public icoOpenTimeChange = this.icoOpenTimeSub.asObservable();

  constructor(http: HttpService) {
    super('meta', http);

    this.get('ico_open_time')
    .then(resp => {
      let openTime = resp.data;
      this.openTime = openTime;
      // let openTime:any = {
      //   start: '2018-01-02 12:40:00 GMT+07',
      //   end: '2018-01-02 12:50:00 GMT+07'
      // }
      if (!openTime.start || !openTime.end) {
        this.icoOpenTimeSub.next({status: 0, openTime});
        return;
      }

      openTime.start = new Date(openTime.start);
      openTime.end = new Date(openTime.end);

      let now = new Date();      
      let timeout = (openTime.start.getTime() - now.getTime())/1000;
      
      if (timeout <= 0) {
        if (openTime.end.getTime() - now.getTime() > 0) {
          this.icoOpenTimeSub.next({status: 2, openTime});
        
        } else {
          this.icoOpenTimeSub.next({status: 0, openTime});        
          return;
        }        
      } else {
        this.icoOpenTimeSub.next({status: 1, openTime});        
      }


      this.countDownIntervalId = setInterval(() => {
        
        let now = new Date();
        if (now > openTime.end) {
          this.icoOpenTimeSub.next({status: 0, openTime});
          clearInterval(this.countDownIntervalId);
          return;
        }
        
        if (now >= openTime.start && now <= openTime.end) {
          return this.icoOpenTimeSub.next({status: 2, openTime});
        }

      }, 1000);
    });
  }

  getExchange(key: MetaKey, isCache = true) {
    const keyStr = MetaString(key);
    const url = `meta/${keyStr}`;
    let sub;

    if (isCache) {
      sub = this.cache.getItem(url);
      if (!sub) {
        this.cache.removeItem(url);
        sub = this.http.get(url)
        .publishReplay(1)
        .refCount();
        this.cache.setItem(url, sub);
      }
    } else {
      sub = this.http.get(url);
    }

    return sub.toPromise()
    .then((resp) => {
      if (resp && resp.data) {
        return Number(resp.data);
      }

      throw new Error("Can't get rate " + keyStr);
    });
  }

  getPackagesConfig() {
    let url = `meta/${MetaString(MetaKey.PACKAGES_CONFIG)}`;
    let sub = this.cache.getItem(url);
    if (!sub) {
      this.cache.removeItem(url);
      sub = this.http.get(url)
      .publishReplay(1)
      .refCount();
      this.cache.setItem(url, sub);
    }

    return sub
    .toPromise()
    .then(resp => {      
      if (resp.error) {
        this.cache.removeItem(url);
      }

      return resp;
    }).catch(error => {
      this.cache.removeItem(url);
    });
  }

  getIcoPackagesConfig() {
    return this.get(`ico_packages_config`);
  }

  getTickerCTU() {
    return this.get(`ticker_ctu_btc`);
  }

  updateMetas(arr: {key: string, value: any}[]) {
    return this.http.post(`${this.resource}/updates`, arr).toPromise();
  }

  // list(params?: object, spinnerName?: string) {
  //   return Promise.reject('Not implement');
  // }

  

}

export enum MetaKey {
  CTU_BTC = 0,
  CTU_USD,
  BTC_USD,
  PACKAGES_CONFIG,
  BTC_USD_SYSTEM,
  CTU_USD_SYSTEM,
  LAST_TRADE_RATE_USD,
  LAST_TRADE_RATE,
  LAST_TRADE_BID_RATE,
  LAST_TRADE_ASK_RATE,
  TRADE_24H_VOLUMN,
  TRADE_24H_HIGH,
  TRADE_24h_LOW
}


var metaString = [
  'ctu_btc',
  'ctu_usd',
  'btc_usd',
  'packages_config',
  'btc_usd_system',
  'ctu_usd_system',
  'last_trade_rate_usd',
  'last_trade_rate',
  'last_trade_bid_rate',
  'last_trade_ask_rate',
  'trade_24h_volumn',
  'trade_24h_high',
  'trade_24h_low'
];

export function MetaString(key: MetaKey):string {
  var index:number = key;
  return metaString[index];
}
