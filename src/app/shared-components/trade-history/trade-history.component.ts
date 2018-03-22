import { Component, OnInit, Input } from '@angular/core';
import { ExchangeService } from 'app/shared-services/api/exchange.service';
import { AuthenticateService } from 'app/shared-services/authenticate.service';
import { audit } from 'rxjs/operators/audit';

@Component({
  selector: 'app-trade-history',
  templateUrl: './trade-history.component.html',
  styleUrls: ['./trade-history.component.scss']
})
export class TradeHistoryComponent implements OnInit {
  _trades = [];
  order_cancel: any;
  isShowConfirmDialog = false;
  user: any;
  promiseCancelTrade: Promise<any>;

  @Input() set trades (orders: any[]) {
    this._trades = orders;
  }

  get trades() {
    return this._trades;
  }

  constructor(
    private exchangeService: ExchangeService,
    private auth: AuthenticateService
  ) {
    this.user = auth.account;
  }

  ngOnInit() {
  }
}
