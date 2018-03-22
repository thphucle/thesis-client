import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { AuthenticateService } from 'app/shared-services/authenticate.service';
import { DepositService } from 'app/shared-services/api/deposit.service';
import { GlobalService } from 'app/shared-services/global.service';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-deposit-history',
  templateUrl: './deposit-history.component.html',
  styleUrls: ['./deposit-history.component.scss']
})
export class DepositHistoryComponent implements OnInit, OnDestroy, AfterViewInit {

  page = {
    page: 0,
    total: 0,
    perpage: 99999
  };

  deposits = [];
  filtered = [];

  balance;

  role: string;

  user_id:number;
  user:any = {};
  currentTab = 'bitcoin';
  currentDepositAddress = '';

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  
  dtOptions: DataTables.Settings = {
    "lengthMenu": [[25, 50, 100, -1], [25, 50, 100, "All"]],
    "responsive": true,
    "order": [[ 4, "desc" ]],
    "initComplete": () => {
      $.fn['dataTable'].ext.search.push((settings, data, dataIndex) => {
        const date = new Date(data[data.length - 1].split(' ')[0]);
        let fromDate = this.dataTableFilter.fromDate || -Infinity;
        let toDate = this.dataTableFilter.toDate || Infinity;
        if (fromDate <= date && date <= toDate) {
          return true;
        }
        return false;
      });
      setTimeout(() => {        
        this.isShowTable = true;
      }, 500);
    }
  };

  dtTrigger = new Subject();
  isShowTable = false;

  dataTableFilter = {
    fromDate: null,
    toDate: null
  };

  private $destroy = new Subject();
  
  constructor(
    private auth: AuthenticateService,
    private depositService: DepositService,
    private shared: GlobalService
  ) { }

  ngOnInit() {
    this.role = this.auth.account.role;
    this.user_id = this.auth.account.id;
    this.user = this.auth.account;
    this.balance = Object.assign({}, this.user.balance);
    if (this.role == 'admin') {
      this.user_id = this.shared.user_management.user_id;
      
      this.shared.user_management
      .change
      .takeUntil(this.$destroy)
      .subscribe(user => {
        console.log("USER ==> ", user);
        if (!user) return;
        this.user = user;
        this.balance = Object.assign({}, this.user.balance);
      });
    } else {
      this.auth
      .change
      .takeUntil(this.$destroy)
      .subscribe((auth: AuthenticateService) => {
        if (!auth) return;
        this.user = auth.account;
        this.balance = Object.assign({}, this.user.balance);
      });
    }

  }

  ngOnDestroy() {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
    $.fn['dataTable'].ext.search.pop();
  }
  
  ngAfterViewInit() {
    this.setPage({offset: 0});
  }

  async setPage(pageData) {
    this.page.page = pageData.offset;
    await this.list();
  }

  async list() {
    
    try {
      let params = Object.assign({
        user_id: this.user_id,
      }, this.page);
      let resp = await this.depositService.list(params);
      if (resp.error) {
        return toastr.error('List withdraws failed', resp.error.message);
      }

      this.deposits = resp.data;
      this.page.total = resp.total;
            
      this.filterCurrency(this.currentTab);
      
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

  filterCurrency(currency: string) {
    this.filtered = this.deposits.filter(deposit => deposit.currency == currency);
    this.reloadTable();
  }

  changeTab(tabName: string) {
    this.currentTab = tabName;
    this.currentDepositAddress = tabName === 'bitcoin' ? this.user.btc_address : this.user.ctu_address;
    this.filterCurrency(this.currentTab);
  }

  notifyCopied() {
    toastr.success('Copied');
  }

}
