import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { LayoutService } from 'app/shared-services/menu.service';
import { MetaService, MetaKey, MetaString } from 'app/shared-services/api/meta.service';
import { AuthenticateService } from 'app/shared-services/authenticate.service';
import { Subject } from 'rxjs/Subject';
import { SocketService } from 'app/shared-services/socket.service';
import { ExchangeService, TradeService } from 'app/shared-services/api/exchange.service';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-exchange',
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.scss']
})
export class ExchangeComponent implements OnInit, OnDestroy {
  metaKey = {};
  summary: any = {};
  balanceBtc = 0;
  balanceBdl = 0;

  formValueBuy = {
    // amount: 10,
    // rate: 0.001
  }

  formValueSell: any = {};
  private $destroy = new Subject();
  user: any = {};
  myOpenOrders = [];
  myMarketHistoryOrders = [];
  isShowDialog = false;
  order_cancel: any;

  dtOptions: any = {
    "lengthMenu": [[10, 50, 100, -1], [10, 50, 100, "All"]],
    "order": [],
    "bFilter": false,
    "bLengthChange": false,
    "bInfo": false
  };
  dtTrigger = new Subject();
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;

  myOrderSubcribe: any;

  marketHistoryTrades = [];
  marketHistoryTradeSubcribe: any;

  myMarketHistoryTrades = [];
  myMarketHistoryTradeSubcribe: any;
  isInitSocket = false;

  constructor(
    layoutService: LayoutService,
    private metaService: MetaService,
    protected auth: AuthenticateService,
    private socketService: SocketService,
    private exchangeService: ExchangeService,
    private tradeService: TradeService
  ) {
    layoutService.setSidebar(true);
    layoutService.setFooter(true);
    layoutService.setPanel(true);
    layoutService.setHeader(false);
    this.user = auth.account;

    let balance = auth.account.balance;
    this.balanceBtc = balance.btc;
    this.balanceBdl = balance.ctu1;
  }

  async ngOnInit() {
    this.auth.change
    .takeUntil(this.$destroy)
    .subscribe(async (auth: AuthenticateService) => {
      if (!auth) { return };
      this.user = auth.account;

      let balance = auth.account.balance;
      this.balanceBtc = balance.btc;
      this.balanceBdl = balance.ctu1;
      if (this.user && this.user.role === 'user' && !this.isInitSocket) {
        this.socketService.initSocket(auth.token);
        this.socketSetup();
      }
    });

    let metas = await this.metaService.list();
    for (let meta of metas.data) {
      this.metaKey[meta.key] = meta;
    }

    let keys = [
      'last_trade_rate',
      'last_trade_bid_rate',
      'last_trade_ask_rate',
      'trade_24h_volumn',
      'trade_24h_high',
      'trade_24h_low'
    ]
    for (let key of keys) {
      let value = this.metaKey[key] && this.metaKey[key].value || 0;
      let old_value = this.metaKey[key] && this.metaKey[key].old_value || 0;

      this.summary[key] = {
        btc: value || 0,
        usd: value * this.metaKey[MetaString(MetaKey.BTC_USD)].value,
        status: value >= old_value ? 'increase' : 'decrease'
      }
    }

    let myOrders = await this.exchangeService.getMyOrder(this.user.id, 'pending');
    this.filterMyOrder(myOrders);
    this.myOrderSubcribe = this.exchangeService.myOrdersChanged.subscribe(
      order =>  {
        let _myOrders = this.exchangeService.getLocalMyOrder(this.user.id);
        this.filterMyOrder(_myOrders);
      }
    )

    this.marketHistoryTrades = await this.tradeService.list({
      page: 0,
      perpage: 200,
      classify: 'active'
    });
    // this.marketHistoryTrades = this.tradeService.getMarketHistory();
    this.marketHistoryTradeSubcribe = this.tradeService.marketHistoryChanged.subscribe(
      trade => {
        this.marketHistoryTrades = this.tradeService.getMarketHistory();
        // console.log("new trade :: ", this.marketHistoryTrades);
      }
    );

    this.myMarketHistoryTrades = await this.tradeService.requestMyMarketHistory(this.user.id);
    this.myMarketHistoryTradeSubcribe = this.tradeService.myMarketHistoryChanged.subscribe(
      trade => {
        this.myMarketHistoryTrades = this.tradeService.getMyMarketHistory();
      }
    )
  }

  filterMyOrder (orders) {
    this.myOpenOrders = orders.filter(order => {
      return order.status === 'pending';
    });
    this.myMarketHistoryOrders = orders.filter(order => {
      return order.status !== 'pending';
    });
    // console.log("filterMyOrder :: ", this.myOpenOrders, this.myMarketHistoryOrders);
  }

  private socketSetup() {
    this.socketService
    .fromEvent('ORDER_CREATED')
    .takeUntil(this.$destroy)
    .subscribe( (order: any) => {
      // console.log("ORDER_CREATED :: ", order, this.user.id);
      this.exchangeService.addOrder(order, this.user.id);
    });

    this.socketService
    .fromEvent('ORDER_UPDATED')
    .takeUntil(this.$destroy)
    .subscribe( (order: any) => {
      // console.log("ORDER_TRADE_UPDATED :: ", order);
      this.exchangeService.addOrder(order, this.user.id);
    });

    this.socketService
    .fromEvent('TRADE_CREATED')
    .takeUntil(this.$destroy)
    .subscribe( (trade: any) => {
      // console.log("ORDER_TRADE_UPDATED :: ", order);
      this.tradeService.addMarketHistory(trade, this.user.id);
    });

    this.isInitSocket = true;
  }

  ngOnDestroy() {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
    this.socketService.disconnect();
    this.myOrderSubcribe.unsubscribe();
    this.marketHistoryTradeSubcribe.unsubscribe();
    this.myMarketHistoryTradeSubcribe.unsubscribe();
  }

  onChangeField (data) {
    this.formValueSell = Object.assign({}, this.formValueSell, {
      [data.field]: data.value
    });
    this.formValueBuy = Object.assign({}, this.formValueBuy, {
      [data.field]: data.value
    });
  }

  changeValueBuySellForm(inputValue, type) {
    // console.log("changeValueBuySellForm ", type, inputValue);
    if (!inputValue) { return; };
    if (type === 'sell') {
      this.formValueSell = Object.assign({}, this.formValueSell, {
        rate: inputValue.rate,
        amount: inputValue.amount
      });
    } else {
      this.formValueBuy = Object.assign({}, this.formValueBuy, {
        rate: inputValue.rate,
        amount: inputValue.amount
      });
    }
  }

  reloadTable() {
    if (this.dtElement && this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        // dtInstance.destroy();
        // this.dtTrigger.next();
        dtInstance.draw();
      });
    } else {
      this.dtTrigger.next();
    }
  }

  getClassStatus (key, caret?: boolean) {
    let status = this.summary[key] && this.summary[key].status;
    let myClass = '';
    if (status && status == 'decrease') {
      if (caret) {
        myClass = 'fa-caret-down';
      }
      return myClass + ' text-off-red';
    }
    if (caret) {
      myClass = 'fa-caret-up';
    }
    return myClass + ' text-off-green';
  }

  async handleCancelOrder () {
    let resp = await this.exchangeService.cancelOrder(this.order_cancel && this.order_cancel.id);
    if (resp.error) {
      toastr.error('Cancel order failed', resp.error.message);
    } else {
      this.exchangeService.addOrder(resp.data, this.user.id);
      console.log("resp :: ", resp);
      // toastr.success('Cancel order success.');
    }
    this.order_cancel = null;
    this.isShowDialog = false;
    $('#modelCancelOrder').modal('hide');
  }

  cancleOrder (order) {
    this.isShowDialog = true;
    $('#modelCancelOrder').modal({backdrop: 'static', keyboard: false});
    $('.modal-backdrop').removeClass("modal-backdrop");
    this.order_cancel = order;
  }

  hideOverlay () {
    this.isShowDialog = false;
    $('#modelCancelOrder').modal('hide');
  }

  async fastTrade ({price, total, type}) {
    if (type === 'buy') {
      this.formValueSell = Object.assign({}, this.formValueSell, {
        rate: price,
        amount: total
      });
    } else {
      this.formValueBuy = Object.assign({}, this.formValueBuy, {
        rate: price,
        amount: total
      });
    }
  }
}
