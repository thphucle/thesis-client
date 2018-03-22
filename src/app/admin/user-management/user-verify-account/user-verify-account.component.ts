import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../shared-services/global.service';
import { Subject } from 'rxjs';
import { IdentityRequestService } from '../../../shared-services/api/identity-request.service';

@Component({
  selector: 'app-user-verify-account',
  templateUrl: './user-verify-account.component.html',
  styleUrls: ['./user-verify-account.component.scss']
})
export class UserVerifyAccountComponent implements OnInit {
  ident:any = {};
  isShowViewImage = false;
  currentIdentImage: any = {};
  private $destroy = new Subject();
  user;

  constructor(
    protected shared: GlobalService,
    protected identReqService: IdentityRequestService
  ) { }

  ngOnInit() {
    this.shared.user_management
    .change
    .takeUntil(this.$destroy)
    .subscribe(async user => {
      if (!user) return;
      this.user = user;
      if (this.user.identity_status) {
        let identReqRs = await this.identReqService.myIdentityRequest(this.user.id);
        if (identReqRs.error) {
          return toastr.error(identReqRs.error.message, 'Load identity verification failed');
        }
  
        if (Array.isArray(identReqRs.data)) {
          this.ident = identReqRs.data[0];
        } else {
          this.ident = identReqRs.data;
        }        
      } else {
        this.ident = null;
      }
    });
    
  }

  viewImageClick(identImage) {
    this.currentIdentImage = identImage;
    this.isShowViewImage = true;
  }

}
