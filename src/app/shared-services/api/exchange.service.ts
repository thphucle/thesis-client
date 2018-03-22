import { Injectable, EventEmitter } from '@angular/core';
import { AService } from "app/shared-services/api/aservice.service";
import { HttpService } from "app/shared-services/http.service";
import { SpinnerService } from 'app/shared-modules/spinner-module/spinner.service';
import Utils from 'app/shared-classes/utils';
import List from 'app/shared-classes/list';

@Injectable()
export class ExchangeService extends AService {
  orders = new List();
  ordersChanged = new EventEmitter<any>();
  myOrdersChanged = new EventEmitter<any>();
  myOrders = new List();

  constructor(http: HttpService, spinnerService: SpinnerService) {
    super('order', http, spinnerService);
  }

  list(params?: object, spinnerName?: string) {
    let url = `${this.resource}?${Utils.toQueryString(params)}`;
    this.showSpinner(spinnerName, 'list');
    let sub = this.cache.getItem(url);
    if (!sub) {
      this.cache.removeItem(url);
      sub = this.http.get(`${this.resource}`, params)
        .publishReplay(1)
        .refCount();
      this.cache.setItem(url, sub);
    }

    return sub
      .toPromise()
      .then(resp => {
        this.hideSpinner(spinnerName, 'list');
        if (resp.error) {
          this.cache.removeItem(url);
        }
        this.orders.concat(resp.data);
        return this.orders;
      }).catch(error => {
        this.cache.removeItem(url);
      });
  }

  cancelOrder (order_id) {
    return this.http.post(`${this.resource}/cancel-order`, {
      order_id
    }).toPromise();
  }

  sortOrders (orders, type) {
    type = type && type.toLowerCase();
    if (!orders) { return {} };
    if (type === 'buy') {
      orders = orders.sort((a, b) => {
        // giảm dần
        return b['price'] - a['price'];
      });
    } else {
      orders = orders.sort((a, b) => {
        return a['price'] - b['price'];
      });
    }
    return orders;
  }

  async getOrders (type) {
    type = type && type.toLowerCase();
    let orders = this.orders.asArray().slice();

    orders = orders.filter(order => {
      return order.type === type && order.status === 'pending';
    });
    orders = this.mergeOrderByPrice(orders);
    orders = this.sortOrders(orders, type);
    let sum = 0;
    for (let order of orders) {
      order['sum'] = sum + order.total_remain;
      sum = order['sum'];
    }
    return orders;
  }

  addOrder (order, user_id?: number) {
    if (!order || !order.id ) {
      return;
    }
    this.orders.add(order);
    this.ordersChanged.emit(order);
    if (user_id) {
      if (order.user_id == user_id) {
        this.myOrders.add(order);
        this.myOrdersChanged.emit(order);
      }
    }
  }

  mergeOrderByPrice (orders) {
    // merge order which has the same price
    let hash = {};
    let orderMerge = [];

    for (let order of orders) {
      let remain = order.amount - (order.filled || 0);
      if (!hash[order.price]) {
        hash[order.price] = Object.assign({}, order, {
          remain,
          total_remain: remain * order.price,
          user_ids: [order.user_id]
        });
      } else {
        hash[order.price]['amount'] += order.amount;
        hash[order.price]['remain'] += remain;
        hash[order.price]['total'] += order.total;
        hash[order.price]['total_remain'] += remain * order.price;
        hash[order.price]['user_ids'].push(order.user_id);
      }
    }
    for (let key of Object.keys(hash)) {
      orderMerge.push(hash[key]);
    }

    return orderMerge;
  }

  async getMyOrder (user_id, status) {
    let orders = await this.http.get(`${this.resource}`, {
      user_id,
      status,
      perpage: 999999
    }).toPromise();
    this.myOrders = new List(orders.data);
    return this.sortByDate(this.myOrders.asArray().slice());
  }

  getLocalMyOrder (user_id) {
    let orders = this.myOrders.asArray().slice();
    if (!user_id) {
      return orders;
    }
    orders = orders.filter(order => order.user_id == user_id);
    return this.sortByDate(orders);
  }

  sortByDate (arr) {
    arr = arr.sort((a, b) => {
      let dateA = new Date(a['created_at']);
      let dateB = new Date(b['created_at']);
      return dateB.getTime() - dateA.getTime();
    })
    return arr;
  }
}

@Injectable()
export class RateStatisticService extends AService {
  constructor(http: HttpService, spinnerService: SpinnerService) {
    super('rate-statistic', http, spinnerService);
  }
}

@Injectable()
export class TradeService extends AService {
  marketHistory = new List();
  marketHistoryChanged = new EventEmitter<any>();

  myMarketHistory = new List();
  myMarketHistoryChanged = new EventEmitter<any>();

  constructor(http: HttpService, spinnerService: SpinnerService) {
    super('trade', http, spinnerService);
  }

  list(params?: object, spinnerName?: string) {
    let url = `${this.resource}?${Utils.toQueryString(params)}`;
    this.showSpinner(spinnerName, 'list');
    let sub = this.cache.getItem(url);
    if (!sub) {
      this.cache.removeItem(url);
      sub = this.http.get(`${this.resource}`, params)
        .publishReplay(1)
        .refCount();
      this.cache.setItem(url, sub);
    }

    return sub
      .toPromise()
      .then(resp => {
        this.hideSpinner(spinnerName, 'list');
        if (resp.error) {
          this.cache.removeItem(url);
        }
        this.marketHistory.concat(resp.data);
        return this.marketHistory.asArray().slice();
      }).catch(error => {
        this.cache.removeItem(url);
      });
  }

  addMarketHistory (trade, user_id ?: number) {
    if (!trade || !trade.id ) {
      return;
    }
    this.marketHistory.add(trade);
    this.marketHistoryChanged.emit(trade);
    if (user_id) {
      if (trade.user_id == user_id) {
        this.myMarketHistory.add(trade);
        this.myMarketHistoryChanged.emit(trade);
      }
    }
  }

  getMarketHistory () {
    let trades = this.marketHistory.asArray().filter(trade => trade.classify === 'active').slice();
    trades = this.sortByDate(trades);
    return trades;
  }

  sortByDate (arr) {
    arr = arr.sort((a, b) => {
      let dateA = new Date(a['created_at']);
      let dateB = new Date(b['created_at']);
      return dateB.getTime() - dateA.getTime();
    })
    return arr;
  }

  async requestMyMarketHistory (user_id) {
    try {
      if (!user_id) { return [] };
      let params = {
        user_id
      }
      let url = `${this.resource}?${Utils.toQueryString(params)}`;
      let resp = await this.http.get(url).toPromise();
      this.myMarketHistory = new List(resp.data);
      return this.sortByDate(this.myMarketHistory.asArray().slice());
    } catch (e) {
      console.error("Get my market history failed!", e);
      return [];
    }
  }

  getMyMarketHistory () {
    let trades = this.myMarketHistory.asArray().slice();
    return this.sortByDate(trades);
  }

}
