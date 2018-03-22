import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService, PASSWORD_TYPE } from "app/shared-services/api/user.service";
import { ActivatedRoute, Router } from "@angular/router";
import { LayoutService } from 'app/shared-services/menu.service';

@Component({
  selector: 'app-password-forgot',
  templateUrl: './password-forgot.component.html',
  styleUrls: ['./password-forgot.component.scss']
})
export class PasswordForgotComponent implements OnInit, OnDestroy {
  role:string = 'user';
  email: string;
  passwordType: PASSWORD_TYPE;
  passwordTypeName: string;

  isProcessing = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    protected layoutService: LayoutService
  ) { 
    layoutService.setHeader(false);
    layoutService.setFooter(false);
    layoutService.setSidebar(false);
    layoutService.setPanel(false);
    layoutService.setBackgroundImage('/assets/images/bg-1.png');
  }
  
  async ngOnInit() {
    this.role = this.router.url.indexOf('user') > -1 ? 'user' : 'shop';
    let passwordType = this.activatedRoute.snapshot.params['password_type'];

    if ([PASSWORD_TYPE.PRIMARY, PASSWORD_TYPE.SECONDARY].indexOf(passwordType) > -1) {
      this.passwordType = passwordType;
    } else {
      setTimeout(() => {
        toastr.error('Invalid URL, you will be redirected to login page');
        this.router.navigate([this.role, 'login']);
      }, 1500);
    }

    this.passwordTypeName = passwordType.split("_")[1];
  }

  ngOnDestroy() {
    this.layoutService.setBackgroundImage('');
  }

  async requestForgotPassword() {
    if (!this.email || !this.role) {
      return toastr.error('Missing email or role');
    }

    this.isProcessing = true;
    let resp = await this.userService.forgotPassword(this.email, this.role, this.passwordType);
    this.isProcessing = false;
    if (resp.error) {
      return toastr.error(resp.error.message, 'Request forgot password failed');
    }

    toastr.success(`Check your inbox to reset password ${this.passwordType}`);

    setTimeout(() => this.router.navigateByUrl(`/${this.role}/login`), 1500);

  }



}
