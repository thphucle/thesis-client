import { Component, OnInit, ViewChild } from '@angular/core';
import { DatatableComponent } from "@swimlane/ngx-datatable/release";
import { CommissionService } from "app/shared-services/api/commission.service";
import { AuthenticateService } from "app/shared-services/authenticate.service";

@Component({
  selector: 'app-commission',
  templateUrl: './commission.component.html',
  styleUrls: ['./commission.component.scss']
})
export class CommissionComponent implements OnInit {
  data = [];
  original = [];
  currentSearchText = '';
  limitOptions = [25, 30, 40, 50, 100];
  limit = this.limitOptions[1];

  @ViewChild(DatatableComponent) table: DatatableComponent;

  constructor(
    private commissionService: CommissionService,
    private auth: AuthenticateService
  ) { }

  async ngOnInit() {
    await this.list();    
  }

  async list() {    
    
    try {
      let params = Object.assign({
        page: 0,
        perpage: 9999999
      });
      let resp = await this.commissionService.list(params);
      if (resp.error) {
        return toastr.error('List tokens failed', resp.error.message);
      }

      this.data = resp.data;
      this.original = resp.data;      
      
    } catch (error) {
      return toastr.error('Unknown Error', error.message);
    }
  }

  filterByUsername(username: string) {
    this.currentSearchText = username;
    let filtered = [];
    if (!username) {
      filtered = this.original;
    } else {
      filtered = this.original.filter(token => token.User && token.User.username.indexOf(username) > -1);
    }
    this.data = filtered;
    this.table.offset = 0;    
  }

  changeLimit(event) {    
    this.limit = Number(event.target.value);
    this.table.limit = this.limit;
    this.table.pageSize = this.limit;
    
  }
}
