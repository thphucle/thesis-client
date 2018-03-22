import { HttpService } from "../http.service";
import Utils from 'app/shared-classes/utils';
import 'rxjs/add/operator/toPromise';
import { SpinnerService } from "app/shared-modules/spinner-module/spinner.service";
import { Subject, Subscription } from "rxjs";
import {AppCache} from 'app/shared-classes/utils';
import 'rxjs/add/operator/publishReplay';

export class AService {
  
  protected cache = new AppCache();

  constructor(
    protected resource: string,
    protected http: HttpService,    
    protected spinnerService?: SpinnerService) {

  }

  list(params?: object, spinnerName?: string) {
    let url = `${this.resource}?${Utils.toQueryString(params)}`;
    this.showSpinner(spinnerName, 'list');    
    let sub = this.cache.getItem(url);
    if (!sub) {
      this.cache.removeItem(url);
      sub = this.http.get(`${this.resource}`, params)        
        .publishReplay(1)
        .refCount();    
      this.cache.setItem(url, sub);
    }
    
    return sub
      .toPromise()
      .then(resp => {
        this.hideSpinner(spinnerName, 'list');
        if (resp.error) {
          this.cache.removeItem(url);
        }

        return resp;
      }).catch(error => {
        this.cache.removeItem(url);
      });
  }

  get(id: string | number, query?: object, spinnerName?: string) {
    let url = `${this.resource}/${id}`;
    url += query ? ('?' + Utils.buildQueryString(query)) : '';

    this.showSpinner(spinnerName, 'get');

    return this.http.get(url).toPromise()
      .then(resp => {
        this.hideSpinner(spinnerName, 'get');
        return resp;
      });
  }

  update(id: string | number, data, spinnerName?: string) {
    this.showSpinner(spinnerName, 'update');
    return this.http.put(`${this.resource}/${id}`, data).toPromise()
      .then(resp => {
        this.hideSpinner(spinnerName, 'update');
        return resp;
      });
  }

  create(data, spinnerName?: string) {
    this.showSpinner(spinnerName, 'create');
    return this.http.post(`${this.resource}`, data).toPromise()
      .then(resp => {
        this.hideSpinner(spinnerName, 'create');
        return resp;
      });
  }

  destroy(id: string | number, spinnerName?: string) {
    this.showSpinner(spinnerName, 'destroy');
    return this.http.delete(`${this.resource}/${id}`).toPromise()
      .then(resp => {
        this.hideSpinner(spinnerName, 'destroy');
        return resp;
      });
  }

  clearCache() {
    console.log("Clear cache", this.resource);
    delete this.cache;
    this.cache = new AppCache();
  }

  

  protected showSpinner(spinnerName, type: string) {
    
    if (!this.spinnerService) return;
    if (spinnerName) {
      this.spinnerService.show(spinnerName);
    } else {
      this.spinnerService.show(`${this.resource}-${type}`, true);
    }
  }

  protected hideSpinner(spinnerName, type: string) {
    if (!this.spinnerService) return;
    if (spinnerName) {
      this.spinnerService.hide(spinnerName);
    } else {
      this.spinnerService.hide(`${this.resource}-${type}`, true);
    }
  }
  
}
