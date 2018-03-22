import {Component, OnInit, OnDestroy} from "@angular/core";
import {AuthenticateService} from "app/shared-services/authenticate.service";
import {Router} from "@angular/router";
import { UserService } from 'app/shared-services/api/user.service';
import {environment} from "environments/environment";
import { ActivatedRoute } from '@angular/router';
import { LayoutService } from "app/shared-services/menu.service";
import { FormGroup, FormBuilder, Validators, FormControl } from "@angular/forms";
import { PhoneRequestService } from "app/shared-services/api/phone-request.service";
import { GlobalService, Constants } from "app/shared-services/global.service";
import { Observable } from 'rxjs/Observable';
import Utils from 'app/shared-classes/utils';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  nations = [];
  model: any = {};
  otpLogin: any = {};
  loginForm: FormGroup;
  otpForm: FormGroup;
  regisForm: FormGroup;
  promiseLogin: Promise<any>;
  registerReq: Promise<any>;
  promiseOtp: Promise<any>;
  menu = "login";
  state = "login";
  referral = '';

  private $destroy = new Subject();

  constructor(
    protected fb: FormBuilder
    , private constants: Constants
    , private userService: UserService
    , private layoutService: LayoutService
    , private authenService: AuthenticateService
    , private router: Router
    , private activedRoute: ActivatedRoute) {
      this.layoutService.setFooter(false);
      this.layoutService.setHeader(false);
      this.layoutService.setSidebar(false);
      this.layoutService.setPanel(false);
      this.layoutService.setBackgroundImage('/assets/images/bg-1.png');
  }

  ngOnInit() {    
    this.nations = this.constants.PHONE_PREFIX_NATIONS;
    const repeatPw = (control: FormControl) => {
      let value = control.value;
      if (this.regisForm && value !== this.regisForm.get('password').value) {
        return {
          notMatch: true
        };
      }

      return null;
    };
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      g_recapcha: ['', Validators.required]
    });
    this.regisForm = this.fb.group({
      username: ['', [Validators.required, Validators.pattern(/^[a-z][a-z0-9_]{5,29}$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(/^.{6,}$/)]],
      rePassword: ['', [Validators.required, repeatPw]],
      fullname: ['', Validators.required],
      national: ['+84', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{6,11}$/)]],
      g_recapcha: ['', Validators.required]
    });
    this.otpForm = this.fb.group({
      otp_code: ['', Validators.required]
    });
    this.activedRoute
      .queryParams
      .takeUntil(this.$destroy)
      .subscribe(params => {
        if (params['ref']) {
          this.referral = params['ref'];
          this.menu='register';
        }
      });
    if (this.authenService && this.authenService.token) {
      let role = this.authenService.account.role;
      return this.router.navigateByUrl(
        this.authenService.redirectUrl ? this.authenService.redirectUrl : (role === 'user' ? '/user/dashboard' : '/admin/support')
      );
    }    
  }

  ngOnDestroy() {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
    this.layoutService.setBackgroundImage('');
  }

  redirectToHome(message:string) {
    toastr.error('You will be redirected to home page', message);
    return setTimeout(() => {
      this.router.navigate(['/']);
    }, 2000);
  }

  private getPhone() {
    let phone = this.regisForm.controls.phone.value;
    let national = this.regisForm.controls.national.value;

    return national + phone.trim().replace(/^0/, '');
  }

  initStateLogin(rs) {
    this.authenService.updateInfo(rs.token, rs.data);
    this.authenService.createCookie({username: rs.data.username, fullname: rs.data.fullname});

    if (rs.data.role == 'admin') {            
      this.router.navigateByUrl(this.authenService.redirectUrl || "/admin/support");
    } else if (rs.data.role == 'support') {            
      this.router.navigateByUrl(this.authenService.redirectUrl || "/support/support");
    } else {
      this.router.navigateByUrl(this.authenService.redirectUrl || "/user/dashboard");
    }
  }

  async with_otp() {
    this.promiseOtp = this.userService.login(Object.assign({}, this.model, this.otpForm.value, this.otpLogin)).toPromise();
    let rs = await this.promiseOtp;
    if (rs.error) {
      if (rs.error.code ==  106) {
        return toastr.error(rs.error.message, 'Login failed');
      }
      toastr.error(rs.error.message + 'You will be redirected to home page!', 'Login failed');
      return setTimeout(function() {
        location.href = '/';
      }, 4000) 
    }
    this.initStateLogin(rs);
  }


  async login() {
    this.model = this.loginForm.value;
    if (!this.model.g_recapcha) {
      return toastr.error('Please check the box you are not a robot');
    }
    this.promiseLogin = this.userService.check(Object.assign({}, this.model)).toPromise();
    
    let rs = await this.promiseLogin;
    if (rs.error) {
      this.loginForm.patchValue({g_recapcha: ''});
      return toastr.error(rs.error.message, 'Login failed');
    }
    if (rs.data.code && rs.data.code == 204) {
      this.state = 'otp';
      this.otpLogin = {
        random_key: rs.data.random_key,
        user_id: rs.data.user_id
      }
      return toastr.warning('Please provide your OTP code', '2FA Security');
    }
    this.initStateLogin(rs);
  }
  async register() {
    try {
      let formData = this.regisForm.value;
      if (!formData.g_recapcha) {
        return toastr.error('Please check the box you are not a robot');
      }
      let postData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        fullname: formData.fullname.trim(),
        password: formData.password,
        phone: this.getPhone(),
        national: formData.national,
        referral: this.referral
      };
      this.registerReq = this.userService.create(postData);
      let registerRs = await this.registerReq;
      if (registerRs.error) {
        return toastr.error(registerRs.error.message, 'Register failed');
      }
      toastr.success('Please active your account via email to countinue login!', 'Register successfully');
      setTimeout(() => {
        this.router.url === '/login' ? this.router.navigateByUrl("/") : this.router.navigateByUrl("/login");
      }, 3000);
    } catch (e) {
      console.error("Register error : ", e);
      toastr.error(`Error: ${e.stack}`);
    }
    return false;
  }
  
}
