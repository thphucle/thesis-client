import { Component, OnInit, Input, Output, EventEmitter, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { ExchangeService } from 'app/shared-services/api/exchange.service';
import { AuthenticateService } from 'app/shared-services/authenticate.service';

@Component({
  selector: 'app-live-orders',
  templateUrl: './live-orders.component.html',
  styleUrls: ['./live-orders.component.scss']
})
export class LiveOrdersComponent implements OnInit, OnDestroy {
  @Input () type: string;
  // type: buy | sell
  @Output () onClickField = new EventEmitter<any>();
  @Output() onClickFastTrade = new EventEmitter<any>();

  header4: string;
  title: string;
  orders = [];
  filter = {
    page: 0,
    perpage: 999999
  }

  dtOptions: any = {
    "lengthMenu": [[10, 50, 100, -1], [10, 50, 100, "All"]],
    "order": [],
    "bFilter": false,
    "bLengthChange": false,
    "bInfo": false
  };
  dtTrigger = new Subject();
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;

  orderSubcribe: any;
  user: any;

  constructor(
    private exchangeService: ExchangeService,
    private auth: AuthenticateService
  ) {
    this.user = auth.account;
  }

  async ngOnInit() {
    this.type = this.type && this.type.toLowerCase() || "buy";

    this.header4 = this.type === "buy" ? "BID" : "ASK";
    this.title = this.type === "buy" ? "BUYING ORDERS" : "SELLING ORDERS";

    let orders = await this.exchangeService.list(Object.assign({}, this.filter, {
      type: this.type,
      status: 'pending'
    }));
    this.orders = await this.exchangeService.getOrders(this.type);
    // setTimeout(this.reloadTable.bind(this), 1000);

    this.orderSubcribe = this.exchangeService.ordersChanged.subscribe(
      async order =>  {
        this.orders = await this.exchangeService.getOrders(this.type);
        // this.reloadTable();
      }
    )
  }

  ngOnDestroy () {
    this.orderSubcribe.unsubscribe();
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

  selectField (value, field) {
    this.onClickField.emit({
      value,
      field
    });
  }

  fastTrade (order, type) {
    let price = order.price;
    let total = 0;
    for (let o of this.orders) {
      total += o.remain;
      if (o.id === order.id) {
        break;
      }
    }
    this.onClickFastTrade.emit({
      price,
      total,
      type
    });
  }
}
