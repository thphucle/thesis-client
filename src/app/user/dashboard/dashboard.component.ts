import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthenticateService } from 'app/shared-services/authenticate.service';
import { MetaKey, MetaService } from 'app/shared-services/api/meta.service';
import Utils from 'app/shared-classes/utils';
import { TokenService, WalletService } from "app/shared-services/api/commission.service";
import { SocketService } from 'app/shared-services/socket.service';
import { Subject } from 'rxjs/Subject';
import { UserService } from 'app/shared-services/api/user.service';
import { GlobalService } from 'app/shared-services/global.service';
import { StatisticsService } from 'app/shared-services/api/statistics.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: []
})

export class DashboardComponent implements OnInit, OnDestroy {
  user:any = {};

  private expiredAt: Date;
  private $destroy = new Subject();

  constructor(
    private auth: AuthenticateService,
    private metaSerive: MetaService,
    private tokenService: TokenService,
    private socketService: SocketService,
    private userService: UserService,
    private shared: GlobalService,
  ) {
    this.user = Object.assign({}, auth.account || {});
  }

  async ngOnInit() {
  }

  ngOnDestroy() {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  notifyCopyClipboard() {
    toastr.info('CTU Address Copied')
  }  
}
