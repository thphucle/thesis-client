import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy, Input } from '@angular/core';
import { AuthenticateService } from 'app/shared-services/authenticate.service';
import { WithdrawService } from 'app/shared-services/api/withdraw.service';
import { GlobalService } from 'app/shared-services/global.service';
import { Subject, BehaviorSubject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { WalletName } from 'app/shared-services/api/commission.service';

@Component({
  selector: 'app-withdraw-cpn',
  templateUrl: './withdraw.component.html',
  styleUrls: ['./withdraw.component.scss']
})
export class WithdrawComponent implements OnInit, OnDestroy, AfterViewInit {
  _walletName: string = '';
  page = {
    page: 0,
    total: 0,
    perpage: 99999
  };

  withdraws = [];
  isViewInit = new BehaviorSubject(false);
  role: string;
  blockExplorerUrl = '';
  @Input()
  set walletName(val: string) {    
    if (val !== undefined) {
      this._walletName = val;
      if (this._walletName == WalletName.BTC) {
        this.blockExplorerUrl = 'https://blockexplorer.com';
      } else {
        this.blockExplorerUrl = 'https://explorer.bitdeal.co.in'
      }
      if (this.isViewInit.getValue()) {
        this.list();
      } else {
        this.isViewInit.subscribe(isInited => {
          console.log("INIT EVENT ", isInited, Date.now());
          if (!isInited) return;
          this.list();
        });
      }
    }
  }

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  dtOptions: DataTables.Settings = {
    "lengthMenu": [[25, 50, 100, -1], [25, 50, 100, "All"]],
    "order": [],
    "initComplete": () => {      
      setTimeout(() => {
        this.isShowTable = true;
      }, 500);
    }
  };
  dtTrigger = new Subject();
  isShowTable = false;

  dataTableFilter = {
    fromDate: new Date(),
    toDate: new Date()
  };

  user_id:number;
  constructor(
    private auth: AuthenticateService,
    private withdrawService: WithdrawService,
    private shared: GlobalService
  ) { }

  ngOnInit() {
    this.role = this.auth.account.role;
    if (this.role == 'admin') {
      this.user_id = this.shared.user_management.user_id;
    }    
  }

  ngOnDestroy() {
    $.fn['dataTable'].ext.search.pop();
  }

  ngAfterViewInit() {
    console.log("AfterViewInit")
    this.isViewInit.next(true);
  }

  async setPage(pageData) {
    this.page.page = pageData.offset;
    await this.list();
  }

  async list() {    
    
    try {
      let params = Object.assign({
        user_id: this.user_id,
        wallet_name: this._walletName
      }, this.page);
      let resp = await this.withdrawService.list(params);
      if (resp.error) {
        return toastr.error('List withdraws failed', resp.error.message);
      }

      this.withdraws = resp.data;
      this.page.total = resp.total;
      
      this.reloadTable();
      
    } catch (error) {
      return toastr.error('Unknown Error', error.message);
    }
  }

  filterDate(filter) {
    if (filter) {
      this.dataTableFilter.fromDate = filter.from;
      this.dataTableFilter.toDate = filter.to;
    } else {
      this.dataTableFilter.fromDate = this.dataTableFilter.toDate = undefined;
    }

    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.draw();
    });
  }

  reloadTable() {
    if (this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.dtTrigger.next();
      });
    } else {
      this.dtTrigger.next();
    }
  }
}
