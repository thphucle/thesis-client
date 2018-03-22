import { Component, OnInit, Input } from '@angular/core';
import { ExchangeService } from 'app/shared-services/api/exchange.service';
import { AuthenticateService } from 'app/shared-services/authenticate.service';
import { audit } from 'rxjs/operators/audit';

@Component({
  selector: 'app-order-exchange-history',
  templateUrl: './order-exchange-history.component.html',
  styleUrls: ['./order-exchange-history.component.scss']
})
export class OrderExchangeHistoryComponent implements OnInit {
  _orders = [];
  order_cancel: any;
  isShowConfirmDialog = false;
  user: any;
  promiseCancelTrade: Promise<any>;

  @Input() set orders (orders: any[]) {
    this._orders = orders;
    this._orders.map(o => {
      o.remain = o.amount - (o.filled || 0);
      o.total_remain = o.price * o.remain;
      return o;
    });
  }

  get orders() {
    return this._orders;
  }

  constructor(
    private exchangeService: ExchangeService,
    private auth: AuthenticateService
  ) {
    this.user = auth.account;
  }

  ngOnInit() {
  }

  showModalCancel (order) {
    this.isShowConfirmDialog = true;
    this.order_cancel = order;
  }

  async handleCancelOrder () {
    this.promiseCancelTrade = this.exchangeService.cancelOrder(this.order_cancel && this.order_cancel.id);
    let resp = await this.promiseCancelTrade;
    if (resp.error) {
      toastr.error('Cancel order failed', resp.error.message);
    } else {
      this.exchangeService.addOrder(resp.data, this.user.id);
      console.log("resp :: ", resp);
      // toastr.success('Cancel order success.');
    }
    this.order_cancel = null;
    this.isShowConfirmDialog = false;
  }

}
