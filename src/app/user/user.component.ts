import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { GlobalService } from "app/shared-services/global.service";
import { SocketService } from 'app/shared-services/socket.service';
import { AuthenticateService } from 'app/shared-services/authenticate.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { TokenService, CommissionService, WalletService } from 'app/shared-services/api/commission.service';
import { TicketReplyService, TicketService } from 'app/shared-services/api/ticket.service';
import { WithdrawService } from 'app/shared-services/api/withdraw.service';
import { StatisticsService } from 'app/shared-services/api/statistics.service';
import { DepositService } from 'app/shared-services/api/deposit.service';
import { LayoutService } from 'app/shared-services/menu.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})

export class UserComponent implements OnInit, OnDestroy {
  isVisible: boolean = false;
  deposit: any = {
    errorCode: -1
  };

  ctuDeposit: any = {};

  $destroy = new Subject();
  isShowPopupDeposit: boolean = false;
  isShowPopupBdlDeposit: boolean = false;
  isShowAnnPopup: boolean = false;

  constructor(
    private sharedService: GlobalService,
    private socketService: SocketService,
    private auth: AuthenticateService,
    private router: Router,
    private shared: GlobalService,
    private tokenService: TokenService, 
    private commissionService: CommissionService, 
    private transactionService: WalletService,
    private ticketService: TicketService,
    private ticketReplyService: TicketReplyService,
    private statisticsService: StatisticsService,
    private withdrawService: WithdrawService,
    private depositService: DepositService,
    protected layoutService: LayoutService
  ) {
    this.layoutService.setFooter(true);
    this.layoutService.setHeader(false);
    this.layoutService.setPanel(true);
    this.layoutService.setSidebar(true);
  }

  ngOnInit() {    

    this.auth
    .change
    .takeUntil(this.$destroy)
    .subscribe((auth: AuthenticateService) => {
      console.log("AUTH change", auth);
      if (auth) {
        this.socketService.initSocket(auth.token);
        this.socketSetup();
      }
    })
  }

  ngOnDestroy() {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
    this.socketService.disconnect();
    this.clearCache();
    console.log("DESWTROY");
  }

  private socketSetup() {
    this.socketService
      .fromEvent('TOKEN_EXPIRED')
      .takeUntil(this.$destroy)
      .subscribe(data => {
        toastr.warning('TOKEN EXPIRED');
        this.signOut();
      });

    this.socketService
      .fromEvent('PACKAGE_CREATED')
      .takeUntil(this.$destroy)
      .subscribe((resp: any) => {
        console.log("Socket ", resp);
        this.isShowPopupDeposit = true;
        if (resp.error) {
          let data = resp.error.data;
          if (data.ticket) {
            this.deposit.errorCode = 1;
            this.deposit.ctu = data.ctu;
            this.deposit.usd = data.usd;
            this.deposit.ticket = data.ticket;
          } else {
            this.deposit.errorCode = 2;
            this.deposit.message = resp.error.message;
          }

        } else {
          this.deposit.errorCode = 0;
          let data = resp.data;
          this.deposit.ctu = data.ctu;
          this.deposit.tx_id = data.tx_id;
          this.deposit.package_name = data.package_name;
        }
      });

    this.socketService
      .fromEvent('TICKET_REPLY_CREATED')
      .takeUntil(this.$destroy)
      .subscribe((resp: any) => {

        if (this.shared.currentTicket == resp.data.ticket_id) return;
        toastr.info(`New message from ticket #${resp.data.ticket_id}`, 'NEW MESSAGE');
      });

    this.socketService
      .fromEvent('DEPOSIT_CTU_CREATED')
      .takeUntil(this.$destroy)
      .subscribe((resp: any) => {
        console.log('DEPOSIT_CTU_CREATED :: ', resp);
        if (resp.error) {
          return toastr.error(resp.error.message, 'DEPOSIT FAILED');
        }

        this.ctuDeposit = resp.data;
        this.isShowPopupDeposit = false;
        this.isShowPopupBdlDeposit = true;
      });
    
    
  }

  clearCache() {
    this.tokenService.clearCache();
    this.commissionService.clearCache();
    this.transactionService.clearCache();
    this.ticketService.clearCache();
    this.ticketReplyService.clearCache();
    this.statisticsService.clearCache();
    this.withdrawService.clearCache();
    this.depositService.clearCache();
  }

  signOut() {
    this.socketService.disconnect();
    this.router.navigateByUrl(`/user/login`);
    this.auth.clear();
  }

}
