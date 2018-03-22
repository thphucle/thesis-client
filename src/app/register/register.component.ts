import { NgForm, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { UserService } from 'app/shared-services/api/user.service';
import { PhoneRequestService } from "app/shared-services/api/phone-request.service";
import { GlobalService, Constants } from "app/shared-services/global.service";
import { LayoutService } from 'app/shared-services/menu.service';
import { Observable } from 'rxjs/Observable';
import Utils from 'app/shared-classes/utils';
import { Subject } from 'rxjs/Subject';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

export class RegisterComponent implements OnInit, OnDestroy {

  isSentCode:boolean = false;
  nations = [];

  registerForm: FormGroup;
  referral = '';
  parentBranch = '';
  qrCode = '';

  registerReq: Promise<any>;
  generateOtpReq: Promise<any>;
  testPromise: Promise<any>;

  private $destroy = new Subject();

  constructor(
    private constants: Constants,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private layoutService: LayoutService,
    private fb: FormBuilder,
    private phoneRequestService: PhoneRequestService
  ) {
    this.nations = constants.PHONE_PREFIX_NATIONS;
    this.layoutService.setFooter(false);
    this.layoutService.setHeader(false);
    this.layoutService.setSidebar(false);
    this.layoutService.setPanel(false);
    this.layoutService.setBackgroundImage('/assets/images/bg-2.jpg');
  }

  ngOnInit() {
    this.nations = this.constants.PHONE_PREFIX_NATIONS;
    const repeatPw = (control: FormControl) => {
      let value = control.value;
      
      if (this.registerForm && value !== this.registerForm.get('password').value) {
      
        return {
          notMatch: true
        };
      }

      return null;
    };

    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.pattern(/^[a-z][a-z0-9_]{5,29}$/)]],
      email: ['', [Validators.required, Validators.email]],
      fullname: ['', Validators.required],
      national: ['+84', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{6,11}$/)]],
      password: ['', [Validators.required, Validators.pattern(/^.{6,}$/)]],
      repeat_password: ['', [Validators.required, repeatPw]],
      // telegram_code: ['', [Validators.required]],
      parent_branch: ['left']
      // otp_code: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
    });

    //otpauth://totp/Example:alice@google.com?secret=JBSWY3DPEHPK3PXP&issuer=Example
    this.route
    .queryParams
    .takeUntil(this.$destroy)
    .subscribe(params => {
      if (params['l']) {
        this.referral = params['l'];
        this.parentBranch = 'left';
      }

      if (params['r']) {
        this.referral = params['r'];
        this.parentBranch = 'right';
      }      

      if (!this.referral) {
        return this.redirectToHome('Invalid params');
      }

      if (this.parentBranch) {
        this.registerForm.patchValue({parent_branch: this.parentBranch});
        this.registerForm.get('parent_branch').disable();
      }
    });
  }

  ngOnDestroy() {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
    this.layoutService.setBackgroundImage('');
  }

  sendVerifyCode() {

    let phone = this.registerForm.get('national').value + this.registerForm.get('phone').value;
    this.phoneRequestService.sendCode(phone)
    .then((resp) => {
      if (resp.error) {
        return toastr.error('Your phone number is invalid', 'Phone Number Invalid');
      }

      this.isSentCode = true;
      return toastr.success('Please check your phone to get verify code', 'Sent verify code')
    });
    // api
  }

  async getTelegramCode() {
    this.testPromise = this.phoneRequestService.sendCode(this.getPhone());
    let rs = await this.testPromise;
    if (rs.error) {
      return toastr.error(rs.error.message, "Get verify code failed");
    }

    toastr.success("Please check your Telegram inbox");
  }

  private getPhone() {
    let phone = this.registerForm.controls.phone.value;
    let national = this.registerForm.controls.national.value;

    return national + phone.trim().replace(/^0/, '');
  }

  redirectToHome(message:string) {
    toastr.error('You will be redirected to home page', message);
    return setTimeout(() => {
      this.router.navigate(['/']);
    }, 2000);
  }

  // generateOtp() {
  //   let username = this.registerForm.get('username').value;
  //   if (!username) {
  //     return toastr.error("Please enter username");
  //   }

  //   let phone = this.registerForm.get('phone').value;
  //   if (!phone) {
  //     return toastr.error("Please enter phone number");
  //   }

  //   phone = this.getPhone();

  //   this.generateOtpReq = this.phoneRequestService.generateOtp(username, phone)
  //   .then(resp => {
  //     this.qrCode = resp.data.qrcode_url;
  //     this.otp_secret = resp.data.secret;
  //   });
  // }

  async register() {
    try {
      let formData = this.registerForm.value;
      
      let postData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        fullname: formData.fullname.trim(),
        password: formData.password,
        phone: this.getPhone(),
        // telegram_code: formData.telegram_code,        
        referral: this.referral,        
        branch: this.registerForm.get('parent_branch').value,
        national: formData.national
      };

      this.registerReq = this.userService.create(postData);
      let registerRs = await this.registerReq;

      if (registerRs.error) {
        return toastr.error(registerRs.error.message, 'Register failed');
      }

      toastr.success('Opening login page', 'Register successfully');
      setTimeout(() => {
        this.router.navigateByUrl("/login");
      }, 2000);

    } catch (e) {
      console.error("Register error : ", e);
      toastr.error(`Error: ${e.stack}`);
    }

    return false;
  }
}
