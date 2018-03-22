import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { CommissionService } from 'app/shared-services/api/commission.service' 
import { AuthenticateService } from 'app/shared-services/authenticate.service'
import { GlobalService } from 'app/shared-services/global.service';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-commission',
  templateUrl: './commission.component.html',
  styleUrls: ['./commission.component.scss']
})
export class CommissionComponent implements OnInit, OnDestroy, AfterViewInit {

  page = {
    page: 0,
    total: 0,
    perpage: 9999
  };

  commissions = [];
  user_id:number;

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  
  dtOptions: DataTables.Settings = {
    "responsive": true,
    "lengthMenu": [[25, 50, 100, -1], [25, 50, 100, "All"]],
    "deferRender": true,
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

      this.isShowSpinner = false;

      setTimeout(() => {
        this.isShowTable = true;
      }, 200);
    }
  };
  dtTrigger = new Subject();
  dataTableFilter = {
    fromDate: null,
    toDate: null
  };
  
  isShowTable = false;
  isShowSpinner = false;

  constructor(
      private commissionService: CommissionService
    , private auth: AuthenticateService
    , private shared: GlobalService
  ) { }

  async ngOnInit() {
    let account = this.auth.account;
    this.user_id = account.role == 'user' ? account.id : this.shared.user_management.user_id;    
    await this.setPage({
      offset: 0
    });    
  }

  ngOnDestroy() {
    $.fn['dataTable'].ext.search.pop();    
  }

 async ngAfterViewInit() {    
  }

  async setPage(pageData) {
    this.page.page = pageData.offset;
    this.isShowSpinner = true;
    setTimeout(() => {
      this.list();
    }, 500)
  }

  async list() {    
    
    try {
      let params = Object.assign({
        user_id: this.user_id,
      }, this.page);
      
      let resp = await this.commissionService.list(params);
      if (resp.error) {
        return toastr.error('List product failed', resp.error.message);
      }

      this.commissions = resp.data;
      this.page.total = resp.total;

      this.dtTrigger.next();
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

}
