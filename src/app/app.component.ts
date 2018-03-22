import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router, Routes} from '@angular/router';
import {LoginComponent} from './shared-components/login/login.component';
import {AuthenticateService} from './shared-services/authenticate.service';
import {HttpService} from './shared-services/http.service';
import {WindowRef} from './shared-services/global.service';
import {GlobalService} from './shared-services/global.service';
import { LayoutService } from 'app/shared-services/menu.service';
import { Subject } from 'rxjs';
import { TokenService, CommissionService, WalletService } from 'app/shared-services/api/commission.service';
import { TicketService, TicketReplyService } from 'app/shared-services/api/ticket.service';
import { StatisticsService } from 'app/shared-services/api/statistics.service';
import { WithdrawService } from 'app/shared-services/api/withdraw.service';
import { DepositService } from 'app/shared-services/api/deposit.service';
import { SocketService } from 'app/shared-services/socket.service';
import { ExchangeService, TradeService } from 'app/shared-services/api/exchange.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']  
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'CONTRACTIUM';
  user:any = {};
  sharedData:GlobalService;
  layoutConfig;

  isInitSocket = false;

  private $destroy = new Subject();
  
  constructor(
    private router: Router,
    private auth: AuthenticateService,
    private http: HttpService,
    private window: WindowRef,
    sharedData: GlobalService,
    protected layoutService: LayoutService,
    private tokenService: TokenService, 
    private commissionService: CommissionService, 
    private transactionService: WalletService,
    private ticketService: TicketService,
    private ticketReplyService: TicketReplyService,
    private statisticsService: StatisticsService,
    private withdrawService: WithdrawService,
    private depositService: DepositService,
    private socketService: SocketService,
    private exchangeService: ExchangeService,
    private tradeService: TradeService
  ) {
    this.sharedData = sharedData;
    this.user = auth.account;
  }

  ngOnInit() {

    this.auth.change
    .takeUntil(this.$destroy)
    .subscribe((auth: AuthenticateService) => {
      this.user = auth.account;
      if (auth && auth.account && auth.account.role === 'user' && !this.isInitSocket) {
        this.socketService.initSocket(this.auth.token);
        this.socketSetup();
      }
    });

    this.initToast();
    this.layoutService
    .change
    .takeUntil(this.$destroy)
    .subscribe(config => {
      console.log("change layout config ", config);
      this.layoutConfig = config;
    });

    if (this.auth.token) {
      this.http.post("/token/check", {
        token: this.auth.token
      }).subscribe(res => {
        if (res.error) {
          return this.signOut();
        }
        this.auth.updateInfo(this.auth.token, res.data);
      }, err => {
        this.signOut();
      });
    }
  }

  private socketSetup() {
    let accountInfo = this.auth.account;

    this.socketService
    .fromEvent('TRADE_CREATED_NOTIFY_USER')
    .takeUntil(this.$destroy)
    .subscribe( (trade: any) => {
      console.log("socket TRADE_CREATED_NOTIFY_USER :: ", trade);
      if (trade.type === 'buy') {
        // inscrease ctu1 balance
        accountInfo.balance.ctu1 += (trade.amount || 0);
      } else {
        // inscrease btc balance
        accountInfo.balance.btc += (trade.total || 0);
      }
      this.auth.updateInfo(this.auth.token, accountInfo);
      toastr.info(trade.amount, 'TRADE SUCCESS');
    });

    this.socketService
    .fromEvent('ORDER_CREATED_NOTIFY_USER')
    .takeUntil(this.$destroy)
    .subscribe( ({order, balance}) => {
      console.log("socket ORDER_CREATED_NOTIFY_USER :: ", order, balance);
      let accountBalance = this.user.balance;
      accountBalance.ctu1 = balance.ctu1;
      accountBalance.btc = balance.btc;
      this.auth.updateInfo(this.auth.token, Object.assign({}, this.user, accountBalance));
      return toastr.success("Create order success");
    });

    

    this.socketService
    .fromEvent('ORDER_SUCCESS')
    .takeUntil(this.$destroy)
    .subscribe( ({order, balance}) => {
      // console.log("socket ORDER_SUCCESS :: ", order, balance);
      let accountBalance = this.user.balance;
      accountBalance.ctu1 = balance.ctu1;
      accountBalance.btc = balance.btc;
      this.auth.updateInfo(this.auth.token, Object.assign({}, this.user, accountBalance));
      // this.exchangeService.addOrder(order, this.user.id);
      toastr.success('ORDER TRADE SUCCESS');
    });

    this.socketService
    .fromEvent('ORDER_CANCELED')
    .takeUntil(this.$destroy)
    .subscribe( ({order, balance}) => {
      // console.log("socket ORDER_CANCELED :: ", order, balance);
      let accountBalance = this.user.balance;
      accountBalance.ctu1 = balance.ctu1;
      accountBalance.btc = balance.btc;
      this.auth.updateInfo(this.auth.token, Object.assign({}, this.user, accountBalance));
      // this.exchangeService.addOrder(order, this.user.id);
      toastr.success('ORDER CANCEL SUCCESS');
    });

    this.isInitSocket = true;
  }

  private redirectToLogin() {
    this.router.navigate(['login']);
  }

  ngOnDestroy() {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
    this.socketService.disconnect();
  }

  private initToast() {
    toastr.options = {
      "closeButton": false,
      "debug": false,
      "newestOnTop": true,
      "progressBar": false,
      "positionClass": "toast-bottom-right",
      "preventDuplicates": false,
      "onclick": null,
      "showDuration": "300",
      "hideDuration": "1000",
      "timeOut": "5000",
      "extendedTimeOut": "1000",
      "showEasing": "swing",
      "hideEasing": "linear",
      "showMethod": "fadeIn",
      "hideMethod": "fadeOut"
    };
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
    this.clearCache();
    this.redirectToLogin();
    this.auth.clear();
  }
}
