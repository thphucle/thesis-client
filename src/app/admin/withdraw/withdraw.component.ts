import { Component, OnInit, ViewChild } from '@angular/core';
import { WithdrawService } from 'app/shared-services/api/withdraw.service';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { WalletName } from 'app/shared-services/api/commission.service';

@Component({
  selector: 'app-withdraw',
  templateUrl: './withdraw.component.html',
  styleUrls: ['./withdraw.component.scss']
})

export class WithdrawComponent implements OnInit {
  dataArray = [];
  completedWithdraws = [];
  original = [];
  currentSearchText = '';
  limitOptions = [25, 30, 40, 50, 100];
  limit = this.limitOptions[1];
  toggle: boolean = false;
  sendPromise: Promise<any>;
  currentTab: WalletName | string = WalletName.BTC;

  @ViewChild(DatatableComponent) table: DatatableComponent;

  constructor(
    private withdrawService: WithdrawService
  ) { }

  async ngOnInit() {
    this.chooseTab('btc');
    toastr.options = {
      "closeButton": false,
      "debug": false,
      "newestOnTop": false,
      "progressBar": false,
      "positionClass": "toast-bottom-left",
      "preventDuplicates": false,
      "onclick": null,
      "showDuration": "300",
      "hideDuration": "1000",
      "timeOut": "5000",
      "extendedTimeOut": "1000",
      "showEasing": "swing",
      "hideEasing": "linear",
      "showMethod": "fadeIn",
      "hideMethod": "fadeOut"
    };
  }

  async list(para?: any) {
    try {
      let params = Object.assign({
        page: 0,
        perpage: 9999999,
        status: 'pending'
      });

      params = Object.assign(params, para || {});

      let resp = await this.withdrawService.list(params);
      if (resp.error) {
        return toastr.error('List withdraws failed', resp.error.message);
      }

      this.dataArray = resp.data.map(w => Object.assign({checked: false}, w));
      this.original = this.dataArray;
      this.toggle = false;
    } catch (error) {
      return toastr.error('Unknown Error', error.message);
    }
  }

  async listCompleted(para?:any) {
    let params = Object.assign({
      page: 0,
      perpage: 9999999,
      status: 'completed'
    });

    params = Object.assign(params, para || {});    

    let resp = await this.withdrawService.list(params);
    if (resp.error) {
      return toastr.error('List withdraws failed', resp.error.message);
    }

    this.completedWithdraws = resp.data;
  }

  searchAll(text: string) {
    if (!text) {
      this.dataArray = this.original;
      return;
    }

    this.currentSearchText = text.toLowerCase();
    let filtered = this.original.filter(record => {
      let fields = Object.keys(record);
      let str = '';
      for (let f of fields) {
        let data = record[f];
        let d = new Date(data);
        if (typeof data == 'string' && d.getMilliseconds()) {
          str += ' ' + data.replace('T', ' ');
        } else if (typeof data == 'object') {
          str += ' ' + JSON.stringify(data);
        } else {
          str += ' ' + data;
        }
        str += '\n';
      }

      console.log('str:', str);
      if (str.toString().toLowerCase().indexOf(this.currentSearchText) > -1) {
        return true;
      }
      return false;
    });

    this.dataArray = filtered;
    this.table.offset = 0;
  }

  changeLimit(event) {
    this.limit = Number(event.target.value);
    this.table.limit = this.limit;
    this.table.pageSize = this.limit;
  }

  toggleAll() {
    this.toggle = !this.toggle;
    $('input[type=checkbox]').each((i, x) => {
        $(x).click();
    });
  }

  chooseTab(tab: WalletName|string) {
    this.currentTab = tab;
    this.list({wallet_name: tab});
    this.listCompleted({wallet_name: tab});
  }

  async send() {
    let ids = this.dataArray.filter(w => w.checked).map(w => w.id);
    if (!ids.length) return toastr.error('Please select rows');
    if (this.currentTab == WalletName.BTC && ids.length > 1) {
      return toastr.error('Please select only one transaction when in tab BTC');
    }

    this.sendPromise = this.withdrawService.complete(ids, this.currentTab);
    let resp = await this.sendPromise;

    if (resp.error && resp.error.message !== 'ESOCKETTIMEDOUT') {
      return toastr.error(resp.error.message, 'Sending failed');
    }

    toastr.success('Success');
    this.withdrawService.clearCache();
    this.chooseTab(this.currentTab);
  }

}
