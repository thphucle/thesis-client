import { Component, OnInit, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { AuthenticateService } from 'app/shared-services/authenticate.service';
import { UserService } from "app/shared-services/api/user.service";
import { Router } from '@angular/router';

declare var google:any;

@Component({
  selector: 'app-admin-profile',
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.scss']
})
export class AdminProfileComponent implements OnInit {
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
    password_1: ''
  };

  mode:string = 'view';
  avatarPhoto:string;
  avatarFile:File;
  avatarBase64:string = '';
  linkAccountId:string = '';
  generatedLink:string = '';

  isProcessingPw2 = false;
  isProcessingPw = false;
  isProcessingProfile = false;

  isShowAskPass1 = false;
  isHideOtp = false;
  otpAction = '';

  @ViewChild('avatar') avatarElement: ElementRef;

  constructor(
    private auth: AuthenticateService, 
    private render: Renderer2,
    private userService: UserService,
    protected router: Router
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
    if (this.user.otp_secret) {
      this.otp.qrcode = `otpauth://totp/${this.user.username}?secret=${this.user.otp_secret}&issuer=CTU%20NETWORK&algorithm=SHA1`;
    }
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
    let data = new FormData();
    data.append('fullname', this.updateUser.fullname);
    data.append('avatar', this.avatarFile);
    data.append('ctu_receive_address', this.updateUser.ctu_receive_address);
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
    let rs = await this.userService.getOTPQrCode(this.otp.password_1);
    this.otp.isLoading = false;

    if (rs.error) {
      return toastr.error(rs.error.message, 'Get OTP Qrcode failed');
    }

    this.otp.qrcode = rs.data;
    this.otp.password_1 = '';
    this.isShowAskPass1 = false;
    this.isHideOtp = false;    
  }  

  async removeOTP() {    
    let rs = await this.userService.removeOTP(this.otp.password_1);
    if (rs.error) {
      return toastr.error(rs.error.message, 'Remove OTP failed');
    }

    this.otp.qrcode = '';
    this.otp.password_1 = '';
    this.isShowAskPass1 = false;
    return toastr.success('Remove OTP successfully');
  }

  createOtpClick() {
    this.otpAction = 'create';
    this.isShowAskPass1 = true;
  }

  removeOtpClick() {
    this.otpAction = 'remove';
    this.isShowAskPass1 = true;    
  }

  toggleOtpClick() {
    if (this.isHideOtp) {
      this.otpAction = 'show';
      this.isShowAskPass1 = true;
      return;
    }

    this.isHideOtp = !this.isHideOtp;
  }

  handleOTPAction() {
    if (this.otpAction == 'create') {
      this.getOTPQrcode();
    } else if (this.otpAction == 'remove') {
      this.removeOTP();
    } else if (this.otpAction == 'show') {
      this.getOTPQrcode();
    }
  }

  hideOTPQrcode() {
    this.otp.qrcode = '';
  }

  async linkAccount() {
    let rs = await this.userService.linkAccount(this.linkAccountId);
    if (rs.error) {
      return toastr.error(rs.error.message);
    }

    this.generatedLink = `https://bitdeal.co.in/user/profile?action=linkaccount&token=${rs.data}`;
  }
}
