import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from 'app/shared-services/api/user.service';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  users = [];
  page = {
    page: 0,
    total: 20,
    perpage: 20
  };

  limitOptions = [25, 30, 40, 50, 100];
  dtOptions: DataTables.Settings = {
    "lengthMenu": [[25, 50, 100, -1], [25, 50, 100, "All"]]
  };
  dtTrigger = new Subject();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  constructor(
    private userService: UserService
  ) { }

  ngOnInit() {
    this.page.perpage = this.limitOptions[0];
    this.setPage({offset: 0});
  }

  setPage({offset}) {
    this.page.page = offset;
    this.list();
  }

  async list(options:any = {}) {
    let params = {
      page: this.page.page,
      perpage: this.page.perpage      
    };

    params = Object.assign({}, params, options);

    let usersReq = await this.userService.list(params);
    if (usersReq.error) {
      return toastr.error(usersReq.error.message, 'Load users failed');
    }

    this.users = usersReq.data;
    this.page.total = usersReq.total;
    this.dtTrigger.next();
  }

  changeLimit(value) {
    this.list();
  }

  filterByUsername(username) {
    this.page.page = 0;
    if (this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        // Destroy the table first
        dtInstance.destroy();
        // Call the dtTrigger to rerender again
        this.list({username});
        
      });    
    }
  }

}
