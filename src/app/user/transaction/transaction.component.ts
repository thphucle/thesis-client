import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { AuthenticateService } from "app/shared-services/authenticate.service";
import { WalletService } from "app/shared-services/api/commission.service";
import { WithdrawService } from 'app/shared-services/api/withdraw.service';
import { MetaService, MetaKey } from 'app/shared-services/api/meta.service';
import { GlobalService } from 'app/shared-services/global.service';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styles: [
    `
    app-filter {
      display: inline-block;
    }
    `,
    `           
      :host >>> app-dialog .dialog .dialog-content {
        padding: 20px 10px;
      }

      @media (min-width: 500px) {
        .control-text {
          font-size: 14pt;
        }
        :host >>> app-dialog .dialog {
          top: 150px;
          width: 600px;          
        }
      }
    `,
    `       
      .balance {
        padding: 10px 0;
        font-size: 12pt;
        .value {
          margin-right: 10px;
        }
      }
    `,
    `
      @media (min-width: 768px) {
        .form-withdraw .control-label {
          font-size: 14pt;
        }
  
        .form-withdraw input {
          height: 46px;
          font-size: 14pt
        }

        .form-withdraw p.info {
          font-size: 12pt
        }
      }
    `,
    `
      @media (max-width: 767px) {
        app-filter {
          display: block;
        }
      }
    `
  ]
})
export class TransactionComponent implements OnInit, OnDestroy, AfterViewInit {
  page = {
    page: 0,
    total: 0,
    perpage: 99999999
  };

  transactions = [];
  balance = 0;
  balanceCTU = 0;
  address = '';
  amount = 0;  
  otp = '';
  threshold = 0;

  isWithdrawing = false;
  isShowWithdraw = false;
  amountUSD: number = 0;
  ctuusd: number = 0;

  private timeOutId:any;

  user_id:number;
  account:any;

  fromDate: any;

  dtOptions: DataTables.Settings = {
    "lengthMenu": [[25, 50, 100, -1], [25, 50, 100, "All"]],
    "order": [[0, 'desc']],
    "paging": true,
    "initComplete": () => {
      let self = this;
      $.fn['dataTable'].ext.search.push((settings, data, dataIndex) => {
        const date = new Date(data[data.length - 1].split(' ')[0]);
        let fromDate = this.dataTableFilter.fromDate || -Infinity;
        let toDate = this.dataTableFilter.toDate || Infinity;
        if (fromDate <= date && date <= toDate) {          
          return true;
        }
        return false;
      });
      this.isShowSpinner = false;

      setTimeout(() => {
        this.isShowTable = true;
      }, 200);
    }
  };
  dtTrigger = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  dataTableFilter = {
    fromDate: null,
    toDate: null
  };

  isShowTable = false;
  isShowSpinner = false;
  sub: any;
  typeFilter: string;

  constructor(
      private metaService: MetaService
    , private transactionService: WalletService
    , private withdrawService: WithdrawService
    , private auth: AuthenticateService
    , private shared: GlobalService
    , private route: ActivatedRoute
  ) { }

  async ngOnInit() {
    let account = this.auth.account;
    this.account = account;
    this.threshold = this.account.lock_withdraw;
    this.user_id = account.role == 'admin' ? this.shared.user_management.user_id : account.id;
    await this.requestCTURate();
    // this.transactionService.getBalance(this.user_id).then(resp => {
    //   this.balance = resp.data;
    // });

    this.sub = this.route.queryParams.subscribe(params => {
      this.typeFilter = params['type'];
      this.fromDate = params['from'] && parseInt(params['from']) || null;
      if (this.fromDate) {
        setTimeout(() => {
          this.filterDate({
            from: new Date(this.fromDate),
            to: new Date(this.fromDate)
          });
        }, 1000);
      }
    });

    this.setPage({
      offset: 0
    });
  }

  ngOnDestroy() {
    $.fn['dataTable'].ext.search.pop();
    this.sub.unsubscribe();
  }

  async ngAfterViewInit() {

  }

  async setPage(pageData) {
    this.page.page = pageData.offset;
    this.isShowSpinner = true;
    
    setTimeout(() => {
      this.list();
    }, 500);
  }

  showPopupWithdraw() {
    if (this.threshold === -1) {
      return toastr.error('You cannot withdraw due to you have not activated any package');
    }

    if (!this.account.can_withdraw) {
      return toastr.error('No permission, please contact admin');
    }

    this.isShowWithdraw = true;    
  }
  
  updatePopupWithdraw(rateBdlUsd?:number) {
    rateBdlUsd = rateBdlUsd || this.ctuusd;  
    this.amountUSD = this.amount * rateBdlUsd;
    this.balanceCTU = this.balance / rateBdlUsd;
  }

  private async requestCTURate() {
    let rate = await this.metaService.getExchange(MetaKey.CTU_USD);
    let ctuusd = Math.ceil(rate * 1e6)/1e6;
    this.ctuusd = ctuusd;
    this.updatePopupWithdraw(ctuusd);
    this.timeOutId = setTimeout(this.requestCTURate.bind(this), 30*1e3);
  }

  async list() {

    try {
      let params = Object.assign({
        user_id: this.user_id,
      }, this.page);

      this.transactionService
      .list(params)
      .then(resp => {
        if (resp.error) {
          return toastr.error('List transactions failed', resp.error.message);
        }

        this.transactions = resp.data;
        this.balanceCTU = 0;
        this.balance = 0;
        if (this.typeFilter === 'income') {
          this.transactions = this.transactions.filter(tran => tran.usd > 0);
        }
        this.transactions.forEach(tran => {
          this.balance += tran.wallet_name === 'usd1' ? tran.amount : 0;
        });
        
        this.balanceCTU = this.balance / this.ctuusd;

        this.page.total = resp.total;
        this.dtTrigger.next();
      });

    } catch (error) {
      return toastr.error('Unknown Error', error.message);
    }
  }

  getTransactionType(transaction) {
    // if (transaction.commission_id) return 'commission';
    // if (transaction.token_id) return 'package';
    // if (transaction.withdraw_id) return 'withdraw';
    return transaction.type || '';
  }

  async withdraw() {
    if (this.threshold < this.amountUSD) {
      return toastr.error('Out of limit withdraw amount: $200');
    }
    
    this.isWithdrawing = true;
    let withdrawReq = await this.withdrawService.create({
      address: this.address, 
      amount: this.amount,
      otp: this.otp
    });
    this.isWithdrawing = false;
    if (withdrawReq.error) {
      return toastr.error(withdrawReq.error.message, 'Withdraw Failed');
    }
    
    this.isShowWithdraw = false;
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.setPage({
        offset: 0
      });
    });    
        
    toastr.success('Withdraw successfully');
    let balanceReq = await this.transactionService.getBalance();
    this.amount = 0;

    if (balanceReq.error) {
      return;
    }

    this.balance = balanceReq.data;
    this.auth.account.balance.usd = this.balance;
    this.auth.updateInfo(this.auth.token, this.auth.account);
  }

  filterDate(filter) {
    this.balance = 0;
    this.balanceCTU = 0;
    if (filter) {
      this.dataTableFilter.fromDate = filter.from;
      this.dataTableFilter.toDate = filter.to;
    } else {
      this.dataTableFilter.fromDate = this.dataTableFilter.toDate = undefined;
    }

    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.draw();
    });
  }  
}
