import { Component, OnInit } from '@angular/core';
import { UserService, PASSWORD_TYPE } from "app/shared-services/api/user.service";
import { ActivatedRoute, Router } from "@angular/router";
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { LayoutService } from 'app/shared-services/menu.service';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {
  role:string = 'user';
  username:string;
  salt:string;

  passwordType: PASSWORD_TYPE = PASSWORD_TYPE.PRIMARY;
  passwordTypeName: string = '1';

  isProcessing = false;

  resetPwForm: FormGroup;

  constructor(
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    protected fb: FormBuilder,
    protected layoutService: LayoutService
  ) {

  
    layoutService.setHeader(true);
    layoutService.setFooter(true);
    layoutService.setSidebar(false);
    layoutService.setPanel(false);
  }
  
  ngOnInit() {
    this.role = this.router.url.indexOf('user') > -1 ? 'user' : 'shop';
    this.passwordType = this.activatedRoute.snapshot.params['password_type'];
    this.username = this.activatedRoute.snapshot.params['username'];
    this.salt = this.activatedRoute.snapshot.params['salt'];    
    console.log("Password 2", this.passwordType)
    if (!this.username 
        || !this.salt 
        || !this.role
        || [PASSWORD_TYPE.PRIMARY, PASSWORD_TYPE.SECONDARY].indexOf(this.passwordType) == -1) {

      toastr.error('Missing fields');
      setTimeout(() => this.router.navigateByUrl('/'), 1500);
    }
    
    this.passwordTypeName = this.passwordType.split("_")[1];

    const repeatPw = (control: FormControl) => {
      let value = control.value;      
      if (this.resetPwForm && value !== this.resetPwForm.get('newPassword').value) {        
        return {
          notMatch: true
        };
      }

      return null;
    };

    this.resetPwForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)]],
      retypePassword: ['', [Validators.required, repeatPw]]
    });
  }

  async resetPassword() {    

    this.isProcessing = true;
    var resp = await this.userService.resetPassword(
      this.username,
      this.resetPwForm.controls.newPassword.value,
      this.salt,
      this.role,      
      this.passwordType
    );
    this.isProcessing = false;

    if (resp.error) {
      return toastr.error(resp.error.message, 'Change password failed');
    }

    toastr.success('Change password successfully');
    this.router.navigateByUrl(`${this.role}/login`);
  }

}
