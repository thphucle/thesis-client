import { URLSearchParams } from "@angular/http";

export class AppCache {
  private storage: any = {};
  constructor() { }

  setItem(key: string, val: any, time_live_miliseconds?: number) {
    let now = new Date();
    if (!time_live_miliseconds) {
      const thirtyMinutes = 30 * 60 * 1000;
      time_live_miliseconds = thirtyMinutes;
    }

    let expired_at = new Date(now.getTime() + time_live_miliseconds);

    let item = {
      expired_at,
      value: val
    };

    this.storage[key] = item;
  }

  getItem(key: string) {
    let item = this.storage[key];
    if (!item) return null;

    let { expired_at } = item;
    let now = new Date();

    if (expired_at < now) {
      return null;
    }

    return item.value;
  }

  hasItem(key: string) {
    return this.storage[key] !== undefined;
  }

  removeItem(key: string) {
    delete this.storage[key];
  }

  isItemExpired(key: string) {
    let item = this.storage[key];
    let { expired_at } = item;
    let now = new Date();

    return expired_at < now;
  }
}

export default {
  getTimeInString(duration, startTime, onTimeout) {
    var today = new Date();
    var delta = (duration + startTime.getTime() / 1000) - today.getTime() / 1000;
    if (delta < 0) {
      return onTimeout();
    }

    var days = Math.floor(delta / 86400);
    delta -= days * 86400;
    var hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;
    var minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;
    var seconds = ~~(delta % 60);
    function pad2(n) { return n < 10 ? '0' + n : n }
    var timeleft = (days > 0 ? days + " day(s) " : "") + (hours > 0 ? pad2(hours) + ":" : '') + pad2(minutes) + ":" + pad2(seconds);
    return timeleft;
  },

  getTimeInObject(duration, startTime, onTimeout) {
    var today = new Date();
    var delta = (duration + startTime.getTime() / 1000) - today.getTime() / 1000;
    if (delta < 0) {
      return onTimeout();
    }

    var days = Math.floor(delta / 86400);
    delta -= days * 86400;
    var hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;
    var minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;
    var seconds = ~~(delta % 60);
    function pad2(n) { return n < 10 ? '0' + n : n }
    return {
      days,
      hours,
      minutes,
      seconds
    };
  },

  buildQueryString(params: object): string {
    return this.toQueryString(params);
  },

  toQueryString(queryObject: any): string {
    if (!queryObject) return '';
    let params = new URLSearchParams();
    (<any>Object).entries(queryObject).forEach(entry => {
      let key = entry[0], value = entry[1];
      if (Array.isArray(value)) {
        
        value.forEach(val => {
          params.append(`${key}`, val);
        });
      } else if (value !== null && value !== undefined) {
        params.set(key, value);
      }
    });

    return params.toString();
  },

  extractData(source: object, fields: Array<string>) {
    let newObject: object = {};
    fields.forEach(field => newObject[field] = source[field]);

    return newObject;
  },
  getThisWeek: function (pday) {
    let day = new Date(pday);
    day.setHours(0);
    day.setMinutes(0);
    day.setSeconds(0);
    day.setMilliseconds(0);

    let monday = new Date(day.getTime() - (day.getDay() + 6) % 7 * 86400 * 1000);
    let sunday = new Date(monday.getTime() + 6 * 86400 * 1000);
    sunday.setHours(23);
    sunday.setMinutes(59);
    sunday.setSeconds(59);
    sunday.setMilliseconds(999);
    return [monday, sunday];
  },
  getBoundOfDate: (date: Date) => {
    let beginDate = new Date(date);
    beginDate.setHours(0);
    beginDate.setMinutes(0);
    beginDate.setSeconds(0);

    let endDate = new Date(date);
    endDate.setHours(23);
    endDate.setMinutes(59);
    endDate.setSeconds(59);
    return [beginDate, endDate];
  },
  generateCode: function (n?: number, up = true) {
    n = n || 5;
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < n; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    if (up) {
      text = text.toUpperCase();
    }

    return text;
  },
  eqFloat: function(a: number, b: number) {
    return b - Number.EPSILON < a && a < b + Number.EPSILON;
  },
  gtFloat: function(a: number, b: number) {
    let isEqual = this.eqFloat(a, b);
    if (isEqual) return false;
    return a > b;
  },
  ltFloat: function(a: number, b: number) {
    let isEqual = this.eqFloat(a, b);
    if (isEqual) return false;
    return a < b;
  },
  gteFloat: function(a: number, b: number) {
    let isEqual = this.eqFloat(a, b);
    if (isEqual) return true;
    return a > b;
  },
  lteFloat: function(a: number, b: number) {
    let isEqual = this.eqFloat(a, b);
    if (isEqual) return true;
    return a < b;
  },
}