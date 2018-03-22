import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, ViewChildren, QueryList } from '@angular/core';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { WalletService, WalletName } from 'app/shared-services/api/commission.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Constants, GlobalService } from 'app/shared-services/global.service';
import { AuthenticateService } from 'app/shared-services/authenticate.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DepositService } from 'app/shared-services/api/deposit.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import { MetaService, MetaKey } from 'app/shared-services/api/meta.service';
import { WithdrawService } from 'app/shared-services/api/withdraw.service';
import { WithdrawComponent } from 'app/shared-components/withdraw/withdraw.component';

@Component({
  selector: 'app-wallet-detail',
  templateUrl: './wallet-detail.component.html',
  styleUrls: ['./wallet-detail.component.scss']
})
export class WalletDetailComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren(DataTableDirective)
  dtElements: QueryList<DataTableDirective>;

  @ViewChild(WithdrawComponent) withdrawCpn: WithdrawComponent;

  dtElement: DataTableDirective;
  dtElementDeposit: DataTableDirective;
  
  dtOptions: DataTables.Settings = {
    "lengthMenu": [[25, 50, 100, -1], [25, 50, 100, "All"]],
    "responsive": true,
    "order": [],
    "initComplete": () => {
      $.fn['dataTable'].ext.search.push((settings, data, dataIndex) => {
        const date = new Date(data[data.length - 1].split(' ')[0]);
        let fromDate = this.dataTableFilter.fromDate || -Infinity;
        let toDate = this.dataTableFilter.toDate || Infinity;
        if (fromDate <= date && date <= toDate) {
          return true;
        }
        return false;
      });
      setTimeout(() => {        
        this.isShowTable = true;
      }, 500);
    }
  };

  dtTrigger = new Subject();
  isShowTable = false;

  dtOptionsDeposit: DataTables.Settings = {
    "lengthMenu": [[25, 50, 100, -1], [25, 50, 100, "All"]],
    "responsive": true,
    "order": []    
  };

  dtTriggerDeposit = new Subject();

  dataTableFilter = {
    fromDate: null,
    toDate: null
  };

  rows:any[] = [];
  toWallets:any[] = [];
  deposits:any[] = [];

  walletName;
  walletInfo;
  walletTitle = '...';
  balance;
  feeRate = 0.01;
  limit = {
    transfer: {
      ctu2_ctu1: undefined,
      usd1_ctu1: undefined,
      usd2_ctu2: undefined
    },
    withdraw: {}
  };

  transferRemainLimit;
  isShowTransferRemainLimit = false;

  modes = [];
  ctuUsdExchange;
  btcUsd;
  user_id;
  isShowTransferPopup = false;
  isShowWithdrawPopup = false;  
  transferForm: FormGroup;  
  transferPromise: Promise<any>;
  withdrawForm: FormGroup;
  withdrawPromise: Promise<any>;
  isShowTransferBtn = true;
  isShowWithdrawBtn = true;  
  isShowDeposit = false;
  isShowWithdraw = false;
  userIdentityStatus;
  timeoutId;
  timeoutIdBTC;
  
  private $destroy = new Subject();
  constructor(
    protected fb: FormBuilder,
    protected walletService: WalletService,
    protected depositService: DepositService,
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    protected constants: Constants,
    protected shared: GlobalService,
    protected auth: AuthenticateService,
    protected metaService: MetaService,
    protected withdrawService: WithdrawService
  ) { }

  ngOnInit() {    
    let toWallet = WalletName.USD_2;

    const minTransferAmount = (control: FormControl) => {
      let value = control.value;
      if (Number.isNaN(Number(value))) return {
        isNaN: true
      };
      if (this.walletName == WalletName.BTC && value < 0.00005
      || this.walletName == WalletName.CTU_1 && value < 1.0
      || this.walletName == WalletName.USD_2 && value < 1.0) {        
        return {
          minAmount: true
        };
      }

      return null;
    };

    const minWithdrawAmount = (control: FormControl) => {
      let value = control.value;
      if (Number.isNaN(Number(value))) return {
        isNaN: true
      };
      if (this.walletName == WalletName.BTC && value < this.getMinWithdrawAmount(WalletName.BTC)
      || this.walletName == WalletName.CTU_1 && value < this.getMinWithdrawAmount(WalletName.CTU_1)) {
        return {
          minAmount: true
        };
      }

      return null;
    };
    
    this.transferForm = this.fb.group({
      from_wallet: [{value: this.walletName, disabled: true}],
      to_wallet: [{value: toWallet, disabled: true}],
      to_username: ['', Validators.required],
      mode: ['other'],
      amount: ['', [Validators.required, minTransferAmount]],
      otp_code: ['', Validators.required],
      fee: [{value: 0, disabled: true}]
    });

    this.withdrawForm = this.fb.group({
      wallet_name: [{value: this.walletName, disabled: true}],      
      amount: ['', [Validators.required, minWithdrawAmount]],
      amount_usd: ['', [Validators.required]],
      otp_code: ['', Validators.required],
      fee: [{value: 0, disabled: true}],
      address: ['', Validators.required]
    });

    let obsers = [];
    let sub1 = this.activatedRoute.params    

    obsers.push(sub1);

    if (this.auth.account.role == 'admin') {
      let sub2 = this.shared.user_management.change;
      
      obsers.push(sub2);
    } else {
      let sub2 = this.auth.change;
      obsers.push(sub2);
    }

    Observable.combineLatest(obsers)
    .takeUntil(this.$destroy)
    .subscribe(data => {
      console.log("COmbine ", data);
      if (!data[1]) return;
      let params = data[0];
      let toWallet = WalletName.USD_2;    
      let allowFromWallets = [
        this.constants.WALLET_NAMES_HASH[WalletName.USD_2], 
        this.constants.WALLET_NAMES_HASH[WalletName.CTU_2],
        this.constants.WALLET_NAMES_HASH[WalletName.USD_1],
        /* this.constants.WALLET_NAMES_HASH[WalletName.CTU_1],
        this.constants.WALLET_NAMES_HASH[WalletName.BTC] */
      ];
      let allowWithdrawWallets = [
        this.constants.WALLET_NAMES_HASH[WalletName.CTU_1],
        this.constants.WALLET_NAMES_HASH[WalletName.BTC]
      ];
      const transferLimitWallets = [
        this.constants.WALLET_NAMES_HASH[WalletName.CTU_2],
        this.constants.WALLET_NAMES_HASH[WalletName.USD_1],
        this.constants.WALLET_NAMES_HASH[WalletName.USD_2],
      ];

      let walletName = params['walletName'];
      let wallet = this.constants.WALLET_NAMES_HASH[walletName];
      
      if (!wallet) {
        toastr.warning('Go back... ', 'Invalid wallet name');
        setTimeout(() => {
          this.router.navigate(['..'], {relativeTo: this.activatedRoute});
        }, 2000);

        return;
      }

      this.walletName = walletName;
      this.walletInfo = this.constants.WALLET_NAMES_HASH[this.walletName];
      this.walletTitle = wallet.title;
          
      this.transferForm.get('from_wallet').setValue(this.walletName);

      if (this.walletName == WalletName.USD_2) {
        this.transferForm.get('amount').setValue(this.balance);
        this.transferForm.get('otp_code').enable();
      }

      if (this.walletName == WalletName.CTU_2 || this.walletName == WalletName.USD_1) {
        toWallet = WalletName.CTU_1;        
      }

      if (this.walletName == WalletName.CTU_1 || this.walletName == WalletName.BTC) {
        this.transferForm.get('amount').enable();
        this.transferForm.get('otp_code').enable();
        this.transferForm.get('to_wallet').setValue(this.walletName);        
      }

      if ([WalletName.CTU_2, WalletName.USD_1].indexOf(this.walletName) > -1) {
        this.transferForm.get('to_wallet').setValue(toWallet);
        this.transferForm.get('amount').enable();
        this.transferForm.get('otp_code').disable();
        this.transferForm.get('to_username').disable();
      }

      if (transferLimitWallets.find(w => w.name == this.walletName) && this.transferForm.get('mode').value == 'me') {
        this.isShowTransferRemainLimit = true;
      } else {
        this.isShowTransferRemainLimit = false;
      }

      let user = data[1];

      if (data[1] instanceof AuthenticateService) {
        user = data[1].account;
      }

      this.user_id = user.id;
      this.balance = user.balance[this.walletName];
      this.userIdentityStatus = user.identity_status;
      this.isShowWithdrawBtn = allowWithdrawWallets.find(w => w.name == this.walletName) && this.balance > 0;
      this.isShowTransferBtn = allowFromWallets.find(w => w.name == this.walletName) && this.balance > 0;
      this.transferForm.get('amount').setValue(this.balance);
      this.modes = this.getModes();

      if (this.isShowWithdrawBtn) {
        let fee = this.walletName == WalletName.BTC ? 0.002 : 1;
        console.log("Fee ", fee, this.walletName);
        this.withdrawForm.patchValue({
          wallet_name: this.walletName,
          amount: this.balance - fee,
          fee
        });
        this.isShowWithdraw = true;
      }      

      this.list();
      this.listDeposit();

      this.getLimit();
      this.changeTransferMode(this.transferForm.get('mode').value);
    });    

    this.transferForm.get('amount').valueChanges
    .takeUntil(this.$destroy)
    .subscribe(value => {
      this.fixAmountValue(this.transferForm);
    });

    this.withdrawForm.get('amount').valueChanges
    .takeUntil(this.$destroy)
    .subscribe(value => {      
      this.updateWithdrawForm();
    });

    this.withdrawForm.get('amount_usd').valueChanges
    .takeUntil(this.$destroy)
    .subscribe(value => {      
      let formatValue = this.getFormatAmount(value);
      let rate = this.getRate();
      console.log("Rate ", rate, formatValue / rate);
      if (rate) {
        this.withdrawForm.get('amount').setValue(this.getFormatAmount(formatValue / rate), {emitEvent: false});
      }
    });

    this.transferForm.get('mode').valueChanges
    .takeUntil(this.$destroy)
    .subscribe(value => {
      this.changeTransferMode(value);      
    });    
  }

  ngAfterViewInit() {
    clearTimeout(this.timeoutId);
    this.dtElement = this.dtElements.first;
    this.dtElementDeposit = this.dtElements.last;    
  }

  ngOnDestroy() {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
    $.fn['dataTable'].ext.search.pop();
  }

  async list() {
    let params = {
      page: 0,
      perpage: 999999,
      wallet_name: this.walletName,
      user_id: this.user_id
    };

    this.walletService.clearCache();
    let rs = await this.walletService.list(params);
    if (rs.error) {
      return toastr.error(rs.error.message, 'Load wallet failed');
    }

    this.rows = rs.data;
    this.reloadTable();
    
  }

  async listDeposit() {
    if ([WalletName.CTU_2, WalletName.BTC].indexOf(this.walletName) == -1) {
      this.isShowDeposit = false;
      return;
    } else {
      this.isShowDeposit = true;
    }    

    let params = Object.assign({
      user_id: this.user_id,
      currency: this.walletName == WalletName.CTU_2 ? 'bitdeal' : 'bitcoin'
    });

    let resp = await this.depositService.list(params);
    if (resp.error) {
      return toastr.error('List withdraws failed', resp.error.message);
    }

    this.deposits = resp.data;
    
    this.reloadTableDeposit();
  }

  async getLimit() {
    let rs = await this.walletService.getLimit();
    if (rs.error) {
      return toastr.error(rs.error.message, 'Get limit failed');
    }

    this.limit = Object.assign(this.limit, rs.data);

    this.changeTransferRemain();
  }

  getMinTransferAmount(walletName) {
    switch(walletName) {
      case WalletName.BTC: return 0.0005;
      case WalletName.USD_2:
      case WalletName.CTU_1: return 1;
    }

    return 0;
  }

  getMinWithdrawAmount(walletName) {
    switch(walletName) {
      case WalletName.BTC: return 0.002;
      case WalletName.CTU_1: return 1;
    }

    return 0;
  }

  async getCTUExchangeRate() {
    clearTimeout(this.timeoutId);
    let btcUsd = await this.metaService.getExchange(MetaKey.BTC_USD);
    let trade24hHigh = await this.metaService.getExchange(MetaKey.TRADE_24H_HIGH);
    this.ctuUsdExchange = btcUsd * trade24hHigh;
    this.updateWithdrawForm();
    this.timeoutId = setTimeout(async () => {
      this.getCTUExchangeRate();
    }, 10 * 1000);
  }

  async getBTCExchangeRate() {
    clearTimeout(this.timeoutIdBTC);
    let rate = await this.metaService.getExchange(MetaKey.BTC_USD);
    this.btcUsd = rate;
    this.updateWithdrawForm();
    this.timeoutIdBTC = setTimeout(async () => {
      this.getBTCExchangeRate();
    }, 10 * 1000);
  }

  getRate() {
    return this.walletName == WalletName.BTC ? this.btcUsd : this.ctuUsdExchange;
  }

  private getFormatAmount(value) {
    let val = value + '';
    if (!val) return value;
    let indexDot = val.indexOf('.');
    if (indexDot == -1) return value;
    if (val.length - indexDot < 9) return value;

    let newVal = val.substring(0, indexDot) + val.substr(indexDot, 9);
    return newVal;
  }

  getModes() {
    if ([WalletName.BTC, WalletName.CTU_1].indexOf(this.walletName) > -1) {
      return ['other'];
    }

    if (WalletName.CTU_2 == this.walletName) {
      return ['me'];
    }

    if (WalletName.USD_2 == this.walletName) {
      return ['other', 'me'];
    }

    return [];
  }

  fixAmountValue(form: FormGroup) {
    let value = form.get('amount').value;
    let newVal = this.getFormatAmount(value);
    form.get('amount').setValue(newVal, {onlySelf: true, emitEvent: false});
    return newVal;
  }  

  generateWallets(balance: any, wallets: any[]) {
    return wallets.map(w => Object.assign({balance: balance[w.name]}, w));
  }

  updateWithdrawForm() {
    let formatValue = this.fixAmountValue(this.withdrawForm);
    if (!formatValue) return;
    let rate = this.getRate();
    if (rate) {
      this.withdrawForm.get('amount_usd').setValue(this.getFormatAmount(formatValue * rate), {emitEvent: false});
    }
  }

  changeTransferRemain() {
    let limit;

    switch (this.walletName) {
      case WalletName.CTU_2: limit = this.limit.transfer.ctu2_ctu1;
      break;
      case WalletName.USD_2: limit = this.limit.transfer.usd2_ctu2;
      break;
      case WalletName.USD_1: limit = this.limit.transfer.usd1_ctu1;
      break;
    }

    this.transferRemainLimit = limit || 0;
  }

  changeTransferMode(mode: string) {
    console.log("change mode", this.transferForm);
    if (this.walletName !== WalletName.USD_2) return;      
    if (mode == 'me') {
      this.transferForm.get('to_wallet').setValue(WalletName.CTU_2);
      this.transferForm.get('to_username').disable();
      this.transferForm.get('otp_code').disable();
      this.isShowTransferRemainLimit = true;
    } else {
      this.transferForm.get('to_wallet').setValue(WalletName.USD_2);
      this.transferForm.get('to_username').enable();
      this.transferForm.get('otp_code').enable();
      this.isShowTransferRemainLimit = false;
    }
    console.log("change mode after", this.transferForm);
  }

  filterDate(filter) {
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

  reloadTable() {
    if (this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.dtTrigger.next();
      });
    } else {
      this.dtTrigger.next();
    }
  }

  reloadTableDeposit() {
    if (this.dtElementDeposit.dtInstance) {
      this.dtElementDeposit.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.dtTriggerDeposit.next();
      });
    } else {
      this.dtTriggerDeposit.next();
    }
  }

  transferBtnClick() {
    this.isShowTransferPopup = true;
    if (this.walletName === WalletName.USD_1 || this.walletName === WalletName.USD_2) {
      this.getCTUExchangeRate();
    }
  }

  transferPopupChange(visible) {
    if (visible) return;
    clearTimeout(this.timeoutId);
  }

  withdrawBtnClick() {
    this.isShowWithdrawPopup = true;
    if (this.walletName === WalletName.CTU_1) {
      this.getCTUExchangeRate();
    } else {
      this.getBTCExchangeRate();
    }
  }

  withdrawPopupChange(visible) {
    if (visible) return;
    clearTimeout(this.timeoutIdBTC);
  }

  getFromUser(row) {
    if (row.Commission && row.Commission.User) {
      return row.Commission.User.username || 'N/A';
    }

    if (row.type == 'transfer' && row.amount > 0) {
      return row.transfer && row.transfer.User && row.transfer.User.username || 'N/A';
    }

    return 'N/A';
  }

  getToUser(row) {
    if (row.type == 'transfer' && row.amount < 0) {
      return row.transfer && row.transfer.User && row.transfer.User.username || 'N/A';
    }

    return 'N/A';
  }

  async updateUserBalance() {
    if (this.auth.account.role !== 'admin') {
      let balanceRs = await this.walletService.getBalance(this.user_id);
      if (balanceRs.error) {
        return toastr.error(balanceRs.error.message, 'Get balance failed');
      }

      let account = this.auth.account;
      account.balance = balanceRs.data;

      this.auth.updateInfo(this.auth.token, account);
    }
  }

  async transfer() {
    let formData = this.transferForm.getRawValue();   

    this.transferPromise = this.walletService.transfer(formData);
    let rs = await this.transferPromise;
    if (rs.error) {
      return toastr.error(rs.error.message, 'Transfer failed');
    }

    this.isShowTransferPopup = false;
    toastr.success('Transfer successfully');    
    this.updateUserBalance();
    
  }

  async withdraw() {
    let formData = this.withdrawForm.getRawValue();
    formData.amount = Number(formData.amount);
    console.log("Withdraw ", formData);
    this.withdrawPromise = this.withdrawService.create(formData);
    let rs = await this.withdrawPromise;
    if (rs.error) {
      return toastr.error(rs.error.message, 'Withdraw failed');
    }

    toastr.success(`Withdraw ${rs.data.amount} Successfully`);
    this.updateUserBalance();
    this.withdrawService.clearCache();
    this.withdrawCpn.list();
  }

}
