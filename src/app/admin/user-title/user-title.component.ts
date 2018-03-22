import { Component, OnInit } from '@angular/core';
import { UserService } from 'app/shared-services/api/user.service';
import { MetaService } from 'app/shared-services/api/meta.service';
import { AutocompleteSetting } from 'app/shared-modules/autocomplete/autocomplete.component';
import { TokenService } from 'app/shared-services/api/commission.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-user-title',
  templateUrl: './user-title.component.html',
  styleUrls: ['./user-title.component.scss']
})
export class UserTitleComponent implements OnInit {
  users = [];
  isProcessing = false;
  isCalculating = false;
  page = {
    page: 0,
    perpage: 99999,
    total: 0
  };

  packagesValue: number[] = [];
  usd = 0;
  allUsers = [];
  user:any;

  autocompleteSetting: AutocompleteSetting = {
    textField: 'username',
    valueField: 'username'
  };

  dtOptions: DataTables.Settings = {
    "lengthMenu": [[25, 50, 100, -1], [25, 50, 100, "All"]]
  };
  dtTrigger = new Subject();

  constructor(
    private metaService: MetaService,
    private userService: UserService,
    private tokenService: TokenService
  ) { }

  async ngOnInit() {
    this.loadUserList();
    let resp = await this.metaService.getPackagesConfig();
    if (resp.error) {
      return toastr.error(resp.error.message);
    }

    this.packagesValue = resp.data.map(pack => pack.price);
    this.usd = this.packagesValue[0];
    this.setPage({offset: 0});
  }

  async loadUserList() {
    this.allUsers = await this.userService.getUserList();
  }

  selectUser(u) {
    this.user = u;
  }

  async calc() {
    this.isCalculating = true;
    let rs = await this.userService.calcTitles();
    this.isCalculating = false;
    if (rs.error) {
      return toastr.error(rs.error.message, 'Calculate Title failed');
    }

    this.setPage({offset: 0});
  }

  async reset() {
    let rs = await this.userService.clearAll();
    if (rs.error) {
      return toastr.error(rs.error.message, 'Reset data failed');
    }

    toastr.success('Reset successfully, you can add token and test again');

    this.users = [];
    this.page = {
      page: 0,
      perpage: 25,
      total: 0
    };
  }

  setPage({offset}) {
    this.page.page = offset;
    this.list();
  }

  /**
   * list only users have title
   */
  async list() {    
    let params = {
      page: this.page.page,
      perpage: this.page.perpage
    };

    let rs = await this.userService.getUsersTitle(params);
    if (rs.error) {
      return toastr.error(rs.error.message, 'Get users failed');
    }

    this.page.total = rs.total;
    let users = rs.data;
    this.users = users.map(u => {
      if (u.Wallets) {
        u['bonus_amount'] = u.Wallets && u.Wallets.length ? u.Wallets[0].usd : 0;
      }

      return u;
    });

    this.dtTrigger.next();
  }

  async activePackage() {
    if (!this.user) return toastr.error('Plz select a user');
    let data = {
      usd: this.usd,
      tx_id: Date.now() + '',
      ctu_address: this.user.ctu_address,
      currency: 'bitdeal'
    };

    this.isProcessing = true;
    let tokenCreateResp = await this.tokenService.create(data);
    this.isProcessing = false;

    if (tokenCreateResp.error) {
      return toastr.error(tokenCreateResp.error.message, 'Active package failed');
    }

    toastr.success('Active package successfully');
  }

}
