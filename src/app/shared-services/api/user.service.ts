import {Injectable} from '@angular/core';
import {HttpService} from "../http.service";
import 'rxjs/add/operator/toPromise';
import { AService } from 'app/shared-services/api/aservice.service';
import util from 'app/shared-classes/utils';

export enum PASSWORD_TYPE {
  PRIMARY = 'password_1',
  SECONDARY = 'password_2'
}

@Injectable()
export class UserService extends AService{

  constructor(http: HttpService) {
    super('user', http);
  }

  login(data) {
    return this.http.post(`/login`, data);
  }
  check(data) {
    return this.http.post(`/login/check`, data);
  }
  loginWithOtp(data) {
    return this.http.post(`/login/with-otp`, data);
  }
  shopLogin(data) {
    return this.http.post(`/login-shop`, data);
  }

  async getUserList() {
    let res = await this.http.get("/user?perpage=9999999").toPromise();
    if (res.code == -1 || res.error) throw res.error;
    return res.data;
  }

  async getListFromUser(user_id?:number) {
    let url = "/user/listfromuser";
    if (user_id) {
      url += `?user_id=${user_id}`;
    }
    let res = await this.http.get(url).toPromise();
    if (res.code == -1 || res.error) throw res.error;
    return res.data;
  }

  async getListFromUserTitleHistory(params:any) {
    let url = `/user/listfromuser/titlehistory?${util.buildQueryString(params)}`;

    let res = await this.http.get(url).toPromise();
    if (res.code == -1 || res.error) throw res.error;
    return res.data;
  }

  updateForm(id, formData: FormData) {
    return this.http.putForm(`/user/${id}`, formData).toPromise();
  }

  shopUpdate(id, data) {    
    return this.http.put(`/shop/${id}`, data).toPromise();
  }

  getCampaign(shopId) {
    return this.http.get(`/campaign?shop_id=${shopId}`).toPromise();
  }

  createCampaign(data) {
    return this.http.post(`/campaign`, data).toPromise();
  }

  sendMobileVerifyCode(phone:string) {
    return this.http.post('/shop/validate-phone', {phone}).toPromise();
  }

  forgotPassword(email: string, role: string, passwordType: PASSWORD_TYPE) {
    
    if (['user', 'shop'].indexOf(role) === -1) {
      throw 'role invalid';
    }

    return this.http.post(`/${role}/forgot-password`, {email: email, password_type: passwordType}).toPromise();
  }

  resetPassword(username: string, newPassword: string, salt: string, role:string, password_type: PASSWORD_TYPE) {    
    return this.http.post(`/${role}/reset-password`, {
      username,
      new_password: newPassword,
      salt,
      password_type
    }).toPromise();
  }

  changePassword(username: string, newPassword: string, role:string, password_type: PASSWORD_TYPE) {
    return this.http.post(`/${role}/change-password`, {
      username,
      new_password: newPassword,  
      password_type
    }).toPromise();
  }

  requestChangePassword2(id: number, current_password2: string, role: string) {
    return this.http.post(`/${role}/request-change-password2`, {
      current_password2
    }).toPromise();
  }  

  getOTPQrCode(password: string) {
    return this.http.post(`/user/otp-qrcode`, {password}).toPromise();
  }

  removeOTP(otp_code: string) {
    return this.http.post(`/user/remove-otp-qrcode`, {otp_code}).toPromise();
  }

  async create (user) {
    let res = await this.http.post("/user", user).toPromise();
    return res;
  }

  linkAccount(username: string) {
    return this.http.get("/user/link-account-token").toPromise();
  }

  createStaff(username: string, fullname: string, password: string) {
    return this.http.post("/user/staff", {username, fullname, password}).toPromise();
  }

  clearOTP(user_id: number) {
    return this.http.post("/user/clear-otp", {user_id}).toPromise();
  }

  /**
   * For testing
   */
  getUsersTitle(params) {
    return this.http.get(`title?${util.buildQueryString(params)}`).toPromise();
  }

  calcTitles() {
    return this.http.get(`title/calculate`).toPromise();
  }

  clearAll() {
    return this.http.get(`title/reset`).toPromise();
  }

  getChildActiveCount (user_id) {
    return this.http.get(`user/count-active-child/${user_id}`).toPromise();
  }
  /**
   * Phuc def
   */
  getF1Commissions() {
    return this.http.get(`user/f1-commissions`).toPromise();
  }
}
