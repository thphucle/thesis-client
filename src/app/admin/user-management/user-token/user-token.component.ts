import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { TokenService, WalletName } from 'app/shared-services/api/commission.service';
import { GlobalService, Constants } from 'app/shared-services/global.service';
import { MetaService, MetaKey } from 'app/shared-services/api/meta.service';

@Component({
  selector: 'app-user-token',
  templateUrl: './user-token.component.html',
  styleUrls: ['./user-token.component.scss']
})
export class UserTokenComponent implements OnInit {

  user;
  addLendingForm: FormGroup;
  selectedWallet;
  ctuUsd;
  timeoutId;
  wallets = [];
  
  promise: Promise<any>;
  private $destroy = new Subject();
  constructor(
    protected fb: FormBuilder,
    protected tokenService: TokenService,
    protected shared: GlobalService,
    protected metaService: MetaService,
    protected constant: Constants
  ) { }

  ngOnInit() {
    let wallets = [
      this.constant.WALLET_NAMES_HASH[WalletName.CTU_1],
      this.constant.WALLET_NAMES_HASH[WalletName.USD_2],
    ];    

    this.addLendingForm = this.fb.group({
      wallet_name: ['', Validators.required],
      amount: ['50', Validators.min(50)],
      otp_code: ['', Validators.required]
    });

    this.shared.user_management
    .change
    .takeUntil(this.$destroy)
    .subscribe(user => {
      if (!user) return;
      this.user = user;
      let balance = this.user.balance;
      this.wallets = wallets.map(w => Object.assign({balance: balance[w.name], subtract_amount: 0}, w));
    });

    this.requestCTURate();

    this.addLendingForm.get('wallet_name')
    .valueChanges
    .takeUntil(this.$destroy)
    .subscribe(value => {
      if (!value ) return;
      this.selectedWallet = this.wallets.find(w => w.name == value);
      this.calcWalletAmount();
    });

    this.addLendingForm.get('amount')
    .valueChanges
    .takeUntil(this.$destroy)
    .subscribe(value => {
      if (!value ) return;      
      this.calcWalletAmount();
    });
    
  }

  ngOnDestroy() {
    clearTimeout(this.timeoutId);
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
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

  calcWalletAmount() {    
    let amount = this.addLendingForm.controls.amount.value;
    if (!amount || amount < 50 || !this.ctuUsd) return;

    let wallets = this.wallets;
    if (!wallets) return;
    let remain = amount;
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
    });    
    
  }

  async addLendingPackage() {
    let user = this.user;
    let formData = this.addLendingForm.value;
    let {otp_code, amount, wallet_name} = formData;

    if (!user) {
      return toastr.error('Please choose a user');
    }

    this.promise = this.tokenService.manualCreate(user.id, amount, wallet_name, otp_code);
    let rs = await this.promise;
    if (rs.error) {
      return toastr.error(rs.error.message, 'Manual add sharing package failed');
    }
       
    return toastr.success('Add success');
  }

}
