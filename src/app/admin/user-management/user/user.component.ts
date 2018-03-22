import { Component, OnInit } from '@angular/core';
import { GlobalService } from 'app/shared-services/global.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'app/shared-services/api/user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  user_id:number = -1;
  user:any = {};
  isUpdating = false;

  constructor(
    private shared: GlobalService,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(async snapshot => {      
      this.user_id = snapshot['id'];
      this.shared.user_management.user_id = snapshot['id'];
      let userReq = await this.userService.get(this.user_id);
      this.user = userReq.data;
      this.shared.user_management.user = userReq.data;
      this.router.navigate([{outlets: {updatesection: 'profile-manage'}}], {relativeTo: this.activatedRoute});
    });
  }  
}
