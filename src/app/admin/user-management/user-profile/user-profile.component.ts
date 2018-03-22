import { Component, OnInit, OnDestroy } from '@angular/core';
import { GlobalService } from 'app/shared-services/global.service';
import { UserService } from 'app/shared-services/api/user.service';
import { Subject } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit, OnDestroy {

  promise: Promise<any>;
  user;
  isSeePw = false;
  userProfileForm: FormGroup;
  private $destroy = new Subject();  
  
  constructor(
    protected fb: FormBuilder,
    private shared: GlobalService,
    private userService: UserService,    
  ) { }

  ngOnInit() {
    this.userProfileForm = this.fb.group({
      email: ['', Validators.email],
      phone: [''],
      can_withdraw: [false, Validators.required],
      can_trade: [false],
      new_password: ['', [Validators.pattern(/^.{6,}$/)]]
    });

    this.shared.user_management
    .change
    .takeUntil(this.$destroy)
    .subscribe(user => {
      if (!user) return;
      this.user = user;
      this.userProfileForm.patchValue({
        email: this.user.email,
        can_withdraw: this.user.can_withdraw,
        can_trade: this.user.can_trade,
        phone: this.user.phone
      });
    });
  }

  ngOnDestroy() {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  async clearOTP() {
    let rs = await this.userService.clearOTP(this.user.id);
    if (rs.error) {
      return toastr.error(rs.error.message);
    }

    return toastr.success('Success');
  }

  async onSubmitUpdateUser() {
    let formData = this.userProfileForm.value;

    this.promise = this.userService.update(this.user.id, formData);

    let updateUserResp = await this.promise;

    if (updateUserResp.error) {
      return toastr.error(updateUserResp.error.message, 'Lock withdraw failed');
    }

    toastr.success('Update lock withdraw successfully');
  }

}
