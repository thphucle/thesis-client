import { Component, OnInit, Input, Output, EventEmitter, NgZone } from '@angular/core';
import { MetaService, MetaKey } from 'app/shared-services/api/meta.service';
import { AuthenticateService } from 'app/shared-services/authenticate.service';
import { ExchangeService } from 'app/shared-services/api/exchange.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-buy-sell-ctu-form',
  templateUrl: './buy-sell-ctu-form.component.html',
  styleUrls: ['./buy-sell-ctu-form.component.scss']
})

export class BuySellCTUFormComponent implements OnInit {

  @Input() currentBalance: number;
  @Input() typeForm: string;
  @Input() set inputValues (value) {
    // rate & amount
    let {amount, rate} = value;
    amount = (amount || '') + '';
    rate = (rate || '') + '';

    this.data = Object.assign({}, this.data, {amount, rate});    
    this.calculateTotal('rate', false);
  }
  get inputValues () {
    return this.data;
  }

  @Output() submitEvent = new EventEmitter<any>();
  @Output() changeValueEvent = new EventEmitter<any>();

  rate_type_hash = {
    'Last': MetaKey.LAST_TRADE_RATE,
    'Bid': MetaKey.LAST_TRADE_BID_RATE,
    'Ask': MetaKey.LAST_TRADE_ASK_RATE
  }
  rate: number;
  rate_type: string;
  currentBalanceCurrency: string;  
  data: any = {
    amount: '0.000000000',
    rate: '0.000000000',
    total: '0.000000000'
  };
  TRADE_FEE = 0.0015;
  fee: string;
  isInsufficientBalance = false;
  isShowConfirmDialog = false;
  promiseCreateTrade: Promise<any>;

  user: any;

  constructor(
    private metaService: MetaService,
    private auth: AuthenticateService,
    private exchangeService: ExchangeService,
    protected zone: NgZone,
    protected decimalPipe: DecimalPipe
  ) {
    this.user = auth.account;
  }

  ngOnInit() {
    
    if (!this.currentBalance) {
      this.currentBalance = 0;
    }
    this.getRate('Last');
    
    if (!this.typeForm) {
      this.typeForm = 'buy';
    }
    this.typeForm = this.typeForm.toLowerCase();
    this.prepairData(this.typeForm);
  }

  prepairData (type) {
    if (type === 'buy') {
      this.currentBalanceCurrency = "BTC";
    } else if (type === 'sell') {
      this.currentBalanceCurrency = 'CTU';
    }
  }

  async getRate (type) {
    let key = this.rate_type_hash[type];
    if (!key) { return };
    let rate = await this.metaService.getExchange(key);
    this.data['rate'] = rate + '' || 0;
    this.rate_type = type;
    this.calculateTotal('rate');
  }

  calculateTotal (sourceName: string, callBackEvent = true) {
    if (this.checkBalance(this.getValues(), sourceName)) {
      this.fee = '0.000000000';
      return;
    }
    if (callBackEvent && (sourceName === 'amount' || sourceName === 'rate')) {
      this.changeValueEvent.emit(this.getValues());
    }
  }

  checkBalance(value: {rate: number, amount: number, total: number}, sourceName: string) {
    let {rate, amount, total} = value;

    if (sourceName == 'total' && total == null) {
      return;
    }

    if (sourceName == 'amount' && amount == null) {
      return;
    }

    if (sourceName == 'rate' && rate == null) {
      return;
    }

    let preTotal = parseFloat((rate  * amount).toFixed(11));
    if (sourceName == 'total') {
      preTotal = total;
      amount = preTotal / rate;
    } else if (sourceName == 'amount' && total && !rate) {
      preTotal = total;
      rate = preTotal / amount;
    }

    if (this.typeForm == 'buy') {
      let btcBalance = this.currentBalance || 0;
      console.log("isInsufficientBalance :: ", preTotal, btcBalance)
      this.isInsufficientBalance = preTotal > btcBalance;
    }

    if (this.typeForm == 'sell') {
      let ctuBalance = this.currentBalance || 0;
      this.isInsufficientBalance = amount > ctuBalance;
    }

    if (!Number.isNaN(preTotal)) {
      this.inputValues['total'] = this.toFixed(preTotal.toFixed(8));
      this.fee = this.toFixed((this.TRADE_FEE * preTotal).toFixed(8));
    }

    if (!Number.isNaN(amount)) {
      this.inputValues['amount'] = this.toFixed(amount.toFixed(8));
    }

    if (!Number.isNaN(rate)) {
      this.inputValues['rate'] = this.toFixed(rate.toFixed(8));
    }
    // console.log("this.inputValue :: ", this.inputValues);
  }

  checkLength(srcName: string) {
    let val = this.inputValues[srcName];
    if (!val) return;
    let indexDot = val.indexOf('.');
    if (indexDot == -1) return; // 0.23
    if (val.length - indexDot < 9) return;

    let newVal = val.substring(0, indexDot) + val.substr(indexDot, 9);
    setTimeout(() => {
      this.inputValues[srcName] = newVal;
    });
  }

  getColorBackgroundTitle () {
    if (this.typeForm === 'buy') { return  '#28a745' }
    return '#DB3834';
  }

  getValues() {
    let {amount, rate, total} = this.inputValues;
    amount = amount || '0';
    rate = rate || '0';
    total = total || '0';
    
    return {
      amount: Number(amount.replace(/\,/g, '')),
      rate: Number(rate.replace(/\,/g, '')),
      total: Number(total.replace(/\,/g, ''))
    };
  }

  toFixed(str: string|number) {
    return this.decimalPipe.transform(str, '.8');
  }

  focusInput(srcName: string) {
    let val = this.inputValues[srcName];
    if (!val) return;
    let newVal = Number(val.replace(/\,/g, ''));
    this.inputValues[srcName] = newVal.toFixed(8) + '';
  }

  blurInput(srcName: string) {
    let val = this.inputValues[srcName];
    if (!val) return;
    let newVal = Number(val.replace(/\,/g, ''));
    this.inputValues[srcName] = this.toFixed(newVal);
  }

  async createTrade (values) {
    // this.isShowDialog = true;
    let { amount, rate } = this.getValues();
    let data = {
      amount,
      price: rate,
      type: this.typeForm,
      user_id: this.user.id
    }
    this.promiseCreateTrade = this.exchangeService.create(data);
    let rs = await this.promiseCreateTrade;

    if (rs.error) {
      this.isShowConfirmDialog = false;
      return toastr.error('Create order failed!', rs.error.message);
    }
    
    this.isShowConfirmDialog = false;    
  }

  showDialog () {
    this.isShowConfirmDialog = true;
  }

  setAll () {
    if (this.typeForm === "buy") {
      this.inputValues['amount'] = this.toFixed((this.currentBalance / this.inputValues['rate']).toFixed(8));
    } else {
      this.inputValues['amount'] = this.toFixed(this.currentBalance);
    }
    this.calculateTotal('amount');
  }

  closeDialogCb (event) {
    // do nothing
  }
}
