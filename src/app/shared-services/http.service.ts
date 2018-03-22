import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/map";
import "rxjs/add/observable/throw";
import 'rxjs/add/operator/toPromise';
import {AuthenticateService} from "./authenticate.service";
import {environment} from "../../environments/environment";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";


@Injectable()
export class HttpService {

  server = `${environment.server}/api/v1`;

  constructor(private http: HttpClient, private authenServer: AuthenticateService) {
  }

  createHeader() {
    const jwt = this.authenServer.token || '';
    return new HttpHeaders().set('Authorization', jwt)
    .set('Content-Type', 'application/json');
  }

  get(link, query?: object): Observable<any> {
    const headers = this.createHeader();
    const options = {
      headers: headers,
      params: null
    };

    if (query) {
      let params = new HttpParams();
      (<any>Object).entries(query).forEach(entry => {
        let key = entry[0], value = entry[1];
        
        if (Array.isArray(value)) {
          
          value.forEach(val => {
            params = params.append(`${key}`, val);
          });
        } else if (value !== null && value !== undefined) {
          params = params.set(key, value);
        }
      });

      options.params = params;      
    }

    return this.getWithOptions(link, options);
  }

  post(link, data): Observable<any> {
    const headers = this.createHeader();
    return this.postWithOptions(link, data, {headers: headers});
  }

  postForm(link, formData: FormData): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', this.authenServer.token);
    const options = {headers: headers};
    return this.http.post(`${this.server}/${link}`, formData, options).map(this.extractData).catch(this.handleError);
  }

  put(link, data?: any): Observable<any> {
    const headers = this.createHeader();
    const options = {headers: headers};
    return this.putWithOptions(link, data || {}, options);
  }

  putForm(link, formData?: FormData): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', this.authenServer.token);
    const options = {headers: headers};
    return this.http.put(`${this.server}/${link}`, formData || new FormData(), options).map(this.extractData).catch(this.handleError);
  }

  delete(link): Observable<any> {
    const headers = this.createHeader();
    const options = {headers: headers};
    return this.deleteWithOptions(link, options);
  }

  postWithOptions(link, data, options): Observable<any> {    
    return this.http.post(`${this.server}/${link}`, data, options).map(this.extractData).catch(this.handleError);
  }

  getWithOptions(link, options): Observable<any> {
    return this.http.get(`${this.server}/${link}`, options).map(this.extractData).catch(this.handleError);
  }

  putWithOptions(link, data, options): Observable<any> {
    return this.http.put(`${this.server}/${link}`, data, options).map(this.extractData).catch(this.handleError);
  }

  deleteWithOptions(link, options): Observable<any> {
    return this.http.delete(`${this.server}/${link}`, options).map(this.extractData).catch(this.handleError);
  }

  private extractData(res) {
    if (!environment.production) {
      console.log(res.url, res);

    }
    return res;
  }

  private handleError(error: Response | any) {
    if (!environment.production) {
      console.log("handleError", error);
    }
    // In a real world app, you might use a remote logging infrastructure
    let errMsg = null;
    if (error instanceof Response) {
      const err = error;
      errMsg = {
        message: error.status === 0 ? "Connection is corrupted" : err.statusText,
        code: err.status,
        data: err
      };
    } else {
      errMsg = error.error;
    }
    return Observable.throw(errMsg);
  }
}
