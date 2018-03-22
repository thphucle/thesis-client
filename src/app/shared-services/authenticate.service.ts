import {Injectable} from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";

@Injectable()
export class AuthenticateService {
  private data:any = {};
  activeRole:string = 'user';
  account:any;
  token:string;
  redirectUrl = "";
  callbacks = [];

  private authChange = new BehaviorSubject<boolean | AuthenticateService>(false);
  private loginSub = new BehaviorSubject<boolean | AuthenticateService>(false);

  loginChange = this.loginSub.asObservable();
  change: Observable<boolean | AuthenticateService> = this.authChange.asObservable();

  constructor() {
    console.log("AUTH INIT");
    this.hasToken();
  }

  updateInfo(token, account) {
    let role = account.role;
    let data = {token, account};
    let hasToken = !!this.token;

    this.token = token;
    this.account = account;
    localStorage.setItem("USER_ACCOUNT_DATA", JSON.stringify(data));
    console.log("AUTH EMIT", account);
    this.authChange.next(this);
    if (!hasToken) {
      this.loginSub.next(this);
    }
    for (let cb of this.callbacks) {
      cb(this);
    }
  }

  subscribe(cb) {
    this.callbacks.push(cb);
  }

  hasToken() {
    if (this.token) {
      return true;
    }

    let data = localStorage.getItem('USER_ACCOUNT_DATA');
    if (data) {
      let dataObject = JSON.parse(data);      
      this.account = dataObject.account;
      this.token = dataObject.token;
      return true;    
    }

    return false;
  }

  clear() {
    this.deleteCookie();
    this.token = "";
    this.account = null;    
    localStorage.setItem("USER_ACCOUNT_DATA", "");

    this.authChange.next(false);    

    for (let cb of this.callbacks) {
      cb(this);
    }
  }

  getDomain() {
    var parts = location.hostname.split('.');
    var domain = parts.slice(-2).join('.');
    return domain;
  }

  createCookie(value) {
    var expires = "";
    var domain = this.getDomain();
    var date = new Date();
    date.setTime(date.getTime() + 30*86000);
    expires = "; expires=" + date.toUTCString();
    var cookie = 'CONTRACTIUM' + "=" + JSON.stringify(value) + expires + "; domain=" + domain +"; path=/";
    document.cookie = cookie;
  }

  deleteCookie() {
    var expires = "";
    var domain = this.getDomain();
    var date = new Date();
    date.setTime(date.getTime() - 30*86000);
    expires = "; expires=" + date.toUTCString();
    var cookie = 'CONTRACTIUM' + "=" + JSON.stringify({username :''}) + expires + "; domain=" + domain+"; path=/";
    document.cookie = cookie;
  }
}

