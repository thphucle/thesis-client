import { Component, OnInit, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { AuthenticateService } from 'app/shared-services/authenticate.service';
import { UserService } from "app/shared-services/api/user.service";
import { Router } from '@angular/router';
import { PhoneRequestService } from 'app/shared-services/api/phone-request.service';
import Eth from 'ethjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
declare var google:any;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  accountActivities = [];  
  user:any = {};
  updateUser:any = {};
  updatePasswordData:any = {
    current_password: '',
    new_password: '',
    retype_password: ''
  };
  currentPassword2 = '';
  otp:any = {
    isLoading: false,
    qrcode: null,
    password_1: '',
    otp_code: '',
    otp_request: null
  };
  
  mode:string = 'view';
  avatarPhoto:string;
  avatarFile:File;
  avatarBase64:string = '';
  linkAccountId:string = '';
  generatedLink:string = '';

  isProcessing2FA= false;
  isProcessingPw2 = false;
  isProcessingPw = false;
  isProcessingProfile = false;
  isShowAskOtp = false;
  isHideOtp = false;
  otpStatus = '';

  @ViewChild('avatar') avatarElement: ElementRef;

  constructor(
    private auth: AuthenticateService, 
    private render: Renderer2,
    private userService: UserService,
    protected userRequest: PhoneRequestService,
    protected router: Router,
    protected fb: FormBuilder
  ) {
    this.user = Object.assign({}, auth.account || {});
    this.updateUser = Object.assign({}, this.user);
  }

  ngOnInit() {
      this.init();
  }

  init() {
    this.avatarBase64 = '';
    this.avatarFile = null;
    this.user = Object.assign({}, this.auth.account || {});
    this.updateUser = Object.assign({}, this.user);
    this.user.avatar = this.user.avatar ? this.user.avatar.thumbnail : '/assets/images/ava.png'
    this.avatarPhoto = `url(${this.user.avatar})`;
    this.otpStatus = this.user.has_otp ? 'has_otp' : 'no_otp';
  }

  toggleEdit() {
    this.mode = this.mode == 'view' ? 'edit' : 'view';    
  }

  cancelEdit() {
    this.mode = 'view';
    this.avatarFile = null;
    this.avatarBase64 = null;
    this.avatarPhoto = `url('${this.user.avatar}')`;    
  }

  onMouseLeave() {    
    if (!this.avatarFile) {
      this.avatarPhoto='url(' + this.user.avatar + ')';
    } else {      
      this.render.setStyle(this.avatarElement.nativeElement, 'backgroundImage', `url(${this.avatarBase64})`)      
    }
  }

  setAvatarFile(event) {
    if (!event.target.files.length) return;
    let file = event.target.files[0];
    this.avatarFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.avatarBase64 = reader.result;            
      this.render.setStyle(this.avatarElement.nativeElement, 'backgroundImage', `url(${reader.result})`);      
    }

    reader.readAsDataURL(file);
  }

  async save() {
    this.isProcessingProfile = true;
    if (this.updateUser.eth_address) {
      if (!Eth.isAddress(this.updateUser.eth_address)) {
        this.isProcessingProfile = false;
        return toastr.error('Your ETH Address is not valid', 'Update profile failed');
      }
    }
    else {
      toastr.warning('Your ETH Address is not updated');
    }
    let data = new FormData();
    data.append('fullname', this.updateUser.fullname);
    data.append('eth_address', this.updateUser.eth_address);
    data.append('facebook', this.updateUser.facebook);
    data.append('telegram', this.updateUser.telegram);
    data.append('twitter', this.updateUser.twitter);
    let resp = await this.userService.updateForm(this.updateUser.id, data);
    this.isProcessingProfile = false;
    if (resp.error) {
      return toastr.error(resp.error.message, 'Update profile failed');
    }
    
    this.auth.updateInfo(this.auth.token, resp.data);
    this.init();
    toastr.success('Update profile successfully');
  }

  async changePassword() {
    this.isProcessingPw = true;
    let updatePwResp = await this.userService.update(this.user.id, this.updatePasswordData);
    this.isProcessingPw = false;
    if (this.updatePasswordData.new_pw != this.updatePasswordData.retype_pw) {
      return toastr.error('Passwords are difference');
    }

    if (updatePwResp.error) {
      return toastr.error(updatePwResp.error.message, 'Update password failed');
    }

    this.updatePasswordData = {
      current_pw: '',
      new_pw: '',
      retype_pw: ''
    };

    toastr.success('You will be redirected to login page in a moment', 'Update password successfully');
    setTimeout(() => {
      this.auth.clear();
      this.router.navigate(['login']);
    }, 2000);
  }

  async requestChangePassword2(pw2: string) {
    this.isProcessingPw2 = !this.isProcessingPw2;
   
    let reqResp = await this.userService.requestChangePassword2(this.user.id, pw2, 'user');
    this.isProcessingPw2 = false;
    if (reqResp.error) {
      return toastr.error(reqResp.error.message, 'Request change password 2 failed');
    }    
    this.currentPassword2 = '';
    return toastr.success('An email was sent to your email inbox', 'Request change password 2 successfully');
  }

  async getOTPQrcode() {
    this.otp.isLoading = true;
    let rs = await this.userRequest.generateOtp();
    this.otp.isLoading = false;

    if (rs.error) {
      return toastr.error(rs.error.message, 'Get OTP Qrcode failed');
    }
    this.otp.otp_request = rs.data.request;
    this.otp.qrcode = rs.data.qrcode_url;
    this.otpStatus = 'new_otp';
  }  

  async removeOTP() {    
    let rs = await this.userService.removeOTP(this.otp.otp_code);
    if (rs.error) {
      return toastr.error(rs.error.message, 'Remove OTP failed');
    }

    this.otp.qrcode = '';
    this.otp.otp_code = '';
    this.otp.otp_request = null;

    this.otpStatus = 'no_otp';
    this.isShowAskOtp = false;

    let account = this.auth.account;
    account.has_otp = false;
    account.login_2fa = false;
    account.withdraw_2fa = false;
    this.user.has_otp = false;
    this.updateUser.login_2fa = false;
    this.updateUser.withdraw_2fa = false;
    this.auth.updateInfo(this.auth.token, account);

    return toastr.success('Remove OTP successfully');
  }  

  async activateOtpClick() {
    await this.getOTPQrcode();    
  }

  disableOtpClick() {
    this.isShowAskOtp = true;    
  }

  async cancelEnableOtpClick() {
    if (!this.otp.otp_request.id) return;

    let rs = await this.userRequest.destroy(this.otp.otp_request.id);
    this.otp.otp_code = '';
    this.otp.otp_request = null;
    this.otpStatus = 'no_otp';
  }

  async verifyEnableOtpClick() {
    let rs = await this.userRequest.verifyOtp(this.otp.otp_code);
    if (rs.error) {
      return toastr.error(rs.error.message, 'Verify OTP failed');
    }

    this.otp.otp_code = '';
    this.otp.otp_request = null;
    this.otp.qrcode_url = '';

    let account = this.auth.account;
    account.has_otp = true;
    this.user.has_otp = true;
    this.auth.updateInfo(this.auth.token, account);

    this.otpStatus = 'has_otp';
    return toastr.success('Verify OTP successfully');
  }

  updateProfile() {
    this.save();
  }

  async linkAccount() {
    let rs = await this.userService.linkAccount(this.linkAccountId);
    if (rs.error) {
      return toastr.error(rs.error.message);
    }

    this.generatedLink = `https://bitdeal.co.in/user/profile?action=linkaccount&token=${rs.data}`;
  }

  async authUpdate() {
    this.isProcessing2FA = true;
    let data = new FormData();
    data.append('login_2fa', this.updateUser.login_2fa);
    data.append('withdraw_2fa', this.updateUser.withdraw_2fa);
    let resp = await this.userService.updateForm(this.updateUser.id, data);
    this.isProcessing2FA = false;
    if (resp.error) {
      return toastr.error(resp.error.message, 'Update 2FA Security failed');
    }
    this.auth.updateInfo(this.auth.token, resp.data);
    toastr.success('Update 2FA Security successfully');
  }
}
