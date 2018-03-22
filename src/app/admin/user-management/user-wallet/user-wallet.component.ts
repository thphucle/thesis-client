import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GlobalService } from 'app/shared-services/global.service';
import { UserService } from 'app/shared-services/api/user.service';
import { WalletService, WalletName } from 'app/shared-services/api/commission.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-user-wallet',
  templateUrl: './user-wallet.component.html',
  styleUrls: ['./user-wallet.component.scss']
})
export class UserWalletComponent implements OnInit, OnDestroy {
  listWalletNames = ['btc', 'ctu1', 'ctu2', 'ctu3', 'usd1', 'usd2'];
  walletNames = ['btc', 'ctu1', 'ctu2', 'ctu3', 'usd1', 'usd2'];
  stickers = {
    btc: 'BTC',
    ctu1: 'CTU',
    ctu2: 'CTU',
    ctu3: 'CTU',
    usd1: 'USD',
    usd2: 'USD'
  };
  manualBalanceForm: FormGroup;
  user_id;
  balance;
  user;
  promise: Promise<any>;
  private $destroy = new Subject();
  
  constructor(
    protected fb: FormBuilder,
    protected shared: GlobalService,
    protected userService: UserService,
    protected walletService: WalletService
  ) { }

  async ngOnInit() {
    this.manualBalanceForm = this.fb.group({
      wallet_name: ['ctu1'],
      amount: [0],
      otp_code: ['', Validators.required],
      type: ['manual']
    });

    this.manualBalanceForm
    .get('type')
    .valueChanges    
    .subscribe(value => {
      if (value == 'link_account') {
        this.walletNames = [WalletName.USD_2];
        this.manualBalanceForm.patchValue({
          wallet_name: WalletName.USD_2
        });
        return;
      }

      if (value == 'manual') {
        this.manualBalanceForm.patchValue({
          wallet_name: WalletName.CTU_1
        });
      }

      this.walletNames = this.listWalletNames;
    });

    this.shared.user_management
    .change
    .takeUntil(this.$destroy)
    .subscribe(user => {
      if (!user) return;
      this.user_id = this.shared.user_management.user_id;
      this.user = user;
      this.balance = this.user.balance;
    });    
  }

  ngOnDestroy() {
    this.$destroy.next(true);   
    this.$destroy.unsubscribe();
  }
  async manualIncreaseBalance() {
    let formData = this.manualBalanceForm.value;
    let {wallet_name, amount, otp_code, type} = formData;

    this.promise = this.walletService.manualUpdateWallet(wallet_name, amount, otp_code, this.user_id, type);
    let rs = await this.promise;
    if (rs.error) {
      return toastr.error(rs.error.message, 'Manual modify wallet failed');
    }

    let user = this.shared.user_management.user;
    let balance = user.balance;
    balance[wallet_name] += rs.data.amount;
    user.balance = balance;
    this.shared.user_management.user = user;

    return toastr.success('Manual modify wallet successfully');
  }

}
