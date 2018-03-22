import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'app/shared-services/api/user.service';

@Component({
  selector: 'app-staff',
  templateUrl: './staff.component.html',
  styleUrls: ['./staff.component.scss']
})
export class StaffComponent implements OnInit {

  newStaffForm: FormGroup;
  promiseNewStaff: Promise<any>;

  constructor(
    protected fb: FormBuilder,
    protected userService: UserService
  ) { }

  ngOnInit() {
    this.newStaffForm = this.fb.group({
      username: ['', Validators.required],
      fullname: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  async createStaff() {
    let {username, fullname, password} = this.newStaffForm.value;

    this.promiseNewStaff = this.userService.createStaff(username, fullname, password);
    let rs = await this.promiseNewStaff;
    if (rs.error) {
      return toastr.error(rs.error.message);
    }

    this.newStaffForm.reset();

    return toastr.success('Success');
  }

}
