import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy, QueryList, ViewChildren } from '@angular/core';
import { TokenService, WalletName } from "app/shared-services/api/commission.service";
import { AuthenticateService } from "app/shared-services/authenticate.service";
import { GlobalService, Constants } from 'app/shared-services/global.service';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { ActivatedRoute } from '@angular/router';
import { MetaService, MetaKey } from 'app/shared-services/api/meta.service';

@Component({
  selector: 'app-token',
  templateUrl: './token.component.html',
  styleUrls: ['./token.component.scss']
})
export class TokenComponent implements OnInit, OnDestroy, AfterViewInit {
  page = {
    page: 0,
    total: 0,
    perpage: 999999
  };

  tokens = [];
  tokensDownline = [];
  packages = [];
  user_id:number;

  fromDate: number;
  toDate: number;

  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;

  // @ViewChild('dtTokens')
  // dtElement: DataTableDirective;


  dtOptions: DataTables.Settings = {
    "lengthMenu": [[25, 50, 100, -1], [25, 50, 100, "All"]],
    "order": [[ 3, "desc" ]],
    "initComplete": () => {
      setTimeout(() => {
        this.isShowTable = true;
      }, 500);
    }
  };

  dtOptionsDownline: DataTables.Settings = {
    "lengthMenu": [[25, 50, 100, -1], [25, 50, 100, "All"]],
    "order": [[ 3, "desc" ]],
    "initComplete": () => {
      $.fn['dataTable'].ext.search.push((settings, data, dataIndex) => {
        const date = new Date(data[data.length - 1].split(' ')[0]);
        let fromDate = this.dataTableFilterDownline.fromDate || -Infinity;
        let toDate = this.dataTableFilterDownline.toDate || Infinity;
        if (fromDate <= date && date <= toDate) {
          return true;
        }
        return false;
      });
      this.isShowSpinner = false;
      setTimeout(() => {
        this.isShowTable = true;
      }, 500);
    }
  };

  dtTrigger = new Subject();
  dtTriggerDownline = new Subject();
  isShowTable = false;
  isShowSpinner = false;
  
  dataTableFilter = {
    fromDate: new Date(),
    toDate: new Date()
  };

  dataTableFilterDownline = {
    fromDate: null,
    toDate: null
  };

  sub: any;
  isShowBuyPackage = false;
  isInsufficientBalance = false;
  isManualAmount = false;
  packageAmount = 0;
  buyPackagePromise: Promise<any>;
  timeoutId;
  ctuUsd;
  selectedWallet;
  selectedPackage;
  balance;
  wallets;
  errorMessage = '';

  private $destroy = new Subject();

  constructor(
    private tokenService: TokenService,
    private auth: AuthenticateService,
    private shared: GlobalService,
    private route: ActivatedRoute,
    protected metaService: MetaService,
    protected constants: Constants
  ) { }

  async ngOnInit() {    
    const WALLET_NAMES_HASH = this.constants.WALLET_NAMES_HASH;
    let wallets = [WALLET_NAMES_HASH[WalletName.USD_2], WALLET_NAMES_HASH[WalletName.CTU_1]];

    this.auth
    .change
    .takeUntil(this.$destroy)
    .subscribe((auth: AuthenticateService) => {
      if (!auth) return;
      let account = auth.account;
      this.user_id = account.id;

      if (account.role !== 'user') {
        this.user_id = this.shared.user_management.user_id;
        this.shared.user_management
        .change
        .takeUntil(this.$destroy)
        .subscribe(user => {
          if (!user) return;
          this.balance = user.balance;        
          this.wallets = wallets.map(w => Object.assign({balance: this.balance[w.name], subtract_amount: 0}, w));          
          this.user_id = user.id;
          this.setPage({offset: 0});
          this.checkZeroBalance();
          this.calcWalletAmount();
        });

        return;
      } else {
        this.balance = account.balance;      
        this.wallets = wallets.map(w => Object.assign({balance: this.balance[w.name], subtract_amount: 0, isInsufficient: false}, w));
        this.setPage({offset: 0});
        this.checkZeroBalance();
        this.calcWalletAmount();
      }
      
    });
        

    this.requestCTURate();

    this.sub = this.route.queryParams
    .subscribe(params => {
      this.fromDate = params['from'] && parseInt(params['from']) || null;
      this.toDate = params['to'] && parseInt(params['to']) || null;

      if (this.fromDate && !this.toDate) {
        this.toDate = this.fromDate;
      }
    });    

    this.metaService.getPackagesConfig().then(resp => {
      if (resp.error) {
        return toastr.error(resp.error.message, 'Load packages failed');
      }

      this.packages = resp.data.map((pack, index) => {
        let next = resp.data[index + 1];
        pack.name = '' + pack.price;
        pack.fromPrice = pack.price;
        pack.toPrice = next && next.price || 0;
        pack.title = '$' + pack.price;
        pack.total_ctu = 0;
        pack.weekly_return = pack.price * pack.bonus/100;
        pack.weekly_percent = 100 / pack.period + pack.bonus/100;
        pack.period = pack.period;        
        return pack;
      });

    });
  }

  ngOnDestroy() {
    clearTimeout(this.timeoutId);
    $.fn['dataTable'].ext.search.pop();
    this.sub.unsubscribe();
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  ngAfterViewInit() {
    if (this.fromDate) {
      setTimeout(() => {
        this.filterDate({
          from: new Date(this.fromDate),
          to: new Date(this.toDate)
        });
      }, 1000);
    }
  }

  async setPage(pageData) {
    this.page.page = pageData.offset;
    this.isShowSpinner = true;
    setTimeout(async () => {
      await this.list();      
    }, 500);
  }

  async list() {    
    
    try {
      let params = Object.assign({
        user_id: this.user_id,
        downline: true
      }, this.page);
      let resp = await this.tokenService.list(params);
      if (resp.error) {
        return toastr.error('List tokens failed', resp.error.message);
      }

      this.page.total = resp.total;
      let tokens = [], tokensDownline = [];
      
      resp.data.forEach(token => {
        if (token.User.id == this.user_id) {
          tokens.push(token);
        } else {
          tokensDownline.push(token);
        }
      });

      this.tokens = tokens;
      this.tokensDownline = tokensDownline;      
            
      this.reloadTable(this.getDtElement(false), this.dtTrigger);
      this.reloadTable(this.getDtElement(true), this.dtTriggerDownline);
      
    } catch (error) {
      return toastr.error('Unknown Error', error.message);
    }
  }

  getDtElement(isDownline?: boolean) {    
    return this.dtElements.toArray()[isDownline ? 1 : 0];
  }

  filterDate(filter) {
    if (filter) {
      this.dataTableFilterDownline.fromDate = filter.from;
      this.dataTableFilterDownline.toDate = filter.to;
    } else {
      this.dataTableFilterDownline.fromDate = this.dataTableFilterDownline.toDate = null;
    }

    if (this.getDtElement(true).dtInstance) {
      this.getDtElement(true).dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.draw();
      });
    }
  }

  async requestCTURate() {
    clearTimeout(this.timeoutId);
    let ctuUsd = await this.metaService.getExchange(MetaKey.LAST_TRADE_RATE_USD);
    this.ctuUsd = ctuUsd;
    this.calcWalletAmount();

    setTimeout(() => {
      this.requestCTURate();
    }, 30*1000);
  }

  checkZeroBalance() {
    let sum = this.wallets.reduce((sum, n) => sum + (n.balance > 0 ? n.balance : 0), 0);
    this.isInsufficientBalance = sum <= 0;
  }

  calcWalletAmount() {
    this.isInsufficientBalance = false;

    let wallets = this.wallets;
    let remain = this.packageAmount;
    let isWaiting = false;
    wallets.forEach(w => {
      let sub:number;
      if (w.name == 'usd2') {
        sub = remain;
      }

      if (w.name == 'ctu1' && this.ctuUsd) {
        sub = remain / this.ctuUsd;
        sub = +sub.toFixed(8);
      }

      if (sub !== undefined) {
        w['subtract_amount'] = Math.min(w.balance, sub);
        // remain -= w.name == 'usd2' ? w['subtract_amount'] : w['subtract_amount']*this.ctuUsd;
        w.isInsufficient = w.balance < sub;
      } else {
        isWaiting = true;
      }

      if (this.selectedWallet == w && w.isInsufficient) {
        this.selectedWallet = null;
      }
    });

    this.isInsufficientBalance = wallets.reduce((insufficient, w) => insufficient && w.isInsufficient, true);
    
  }

  lendingPackageClick(pack) {
    if (this.auth.account.role !== 'user') return;
    
    this.selectedPackage = pack;
    this.packageAmount = pack.price;    
    this.isShowBuyPackage = true;
    this.isManualAmount = false;
    this.calcWalletAmount();
  }

  walletClick(wallet) {
    if (wallet.isInsufficient) return;
    this.selectedWallet = wallet;
    this.isInsufficientBalance = this.selectedWallet.isInsufficient;    
  }

  closePopup() {
    this.selectedPackage = null;
    this.selectedWallet = null;
    this.isInsufficientBalance = false;
    this.isShowBuyPackage = false;
  }

  enterAmountBtnClick() {
    this.isManualAmount = true;
  }

  reloadTable(dtElement, dtTrigger) {
    if (dtElement.dtInstance) {
      dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        dtTrigger.next();
      });
    } else {
      dtTrigger.next();
    }
  }

  inputAmountChange() {
    let amount = Number(this.packageAmount);
    if (Number.isNaN(amount) || amount < 50) {
      this.errorMessage = 'Mininum sharing package value is $50';
      return;
    }

    this.errorMessage = '';

    if (parseInt(amount + '') !== amount) {
      // phai la so nguyen
      this.packageAmount = Math.floor(amount);
    }
    
    this.calcWalletAmount();

  }

  async buyPackage() {
    
    this.buyPackagePromise = this.tokenService.create({amount: this.packageAmount, wallet_name: this.selectedWallet.name});
    let rs = await this.buyPackagePromise;
    if (rs.error) {
      return toastr.error(rs.error.message, 'Buy sharing package failed');
    }

    toastr.success('Buy sharing package successfully');
    this.closePopup();
    this.tokens.push(rs.data);
    this.tokenService.clearCache();
    this.reloadTable(this.dtElements.first, this.dtTrigger);
  }
}
