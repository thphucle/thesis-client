import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { WalletService } from 'app/shared-services/api/commission.service';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit {
  transaction = {
    username: '',
    amount: 0,
    dateRate: new Date()
  }
  constructor(private transactionService: WalletService) { }

  ngOnInit() {
  }

  async onSubmit (form: NgForm) {
    console.log("transaction :: ", this.transaction);
    let obj = Object.assign({}, this.transaction);

    let resp = await this.transactionService.create(obj);
    console.log("resp :: ", resp);
    if (resp.error) {
      return toastr.error(resp.error.message);
    }

    toastr.success('Create transaction success!');
  }

}
