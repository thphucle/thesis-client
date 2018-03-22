import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { AuthenticateService } from 'app/shared-services/authenticate.service';
import { GlobalService } from 'app/shared-services/global.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit, OnDestroy {

  user_id;
  user:any = {};
  balance;

  private $destroy = new Subject();
  constructor(
    protected auth: AuthenticateService,
    protected shared: GlobalService
  ) { }

  ngOnInit() {
    this.auth
    .change
    .takeUntil(this.$destroy)
    .subscribe((auth: AuthenticateService) => {
      if (!auth) return;
      if (auth.account.role == 'admin') {
        this.user_id = this.shared.user_management.user_id;
        
        this.shared.user_management
        .change
        .takeUntil(this.$destroy)
        .subscribe(user => {
          console.log("USER ==> ", user);
          if (!user) return;
          this.user = user;
          this.balance = Object.assign({}, this.user.balance);
        });

        return;
      }

      this.user_id = auth.account.id;
      this.user = auth.account;
      this.balance = Object.assign({}, this.user.balance);
    });

    
  }

  ngOnDestroy() {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  notifyCopied() {
    toastr.success('Copied');
  }

}
