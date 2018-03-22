import { Component, OnInit, ViewChild, AfterViewInit, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { UserService } from 'app/shared-services/api/user.service'
import { AuthenticateService } from 'app/shared-services/authenticate.service'
import List from 'app/shared-classes/list'
import { StatisticsService } from 'app/shared-services/api/statistics.service';
import { MetaService } from 'app/shared-services/api/meta.service';
import utils from 'app/shared-classes/utils';
import { GlobalService } from 'app/shared-services/global.service';
import { AutocompleteSetting } from 'app/shared-modules/autocomplete/autocomplete.component';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';


declare var Treant: any;

@Component({
  selector: 'app-network',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.scss']
})
export class NetworkComponent implements OnInit, AfterViewInit {
  @Output() dataChange = new EventEmitter<number>();
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  dtOptions: DataTables.Settings = {
    "lengthMenu": [[5, 25, 50, 100, -1], [5, 25, 50, 100, "All"]],
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

  users = [];
  parents = [];
  commissions = [];
  user;

  domain = '';
  registerLink = '';
  referral = 0;
  deposit = 0;
  total_commission = 0;

  statisticsData = [];
  packagesConfig: any = [];
  user_id: number;s
  isLoading = false;
  selectedMonth;
  selectedYear;
  months = [];
  years = [];

  constructor(
    private userService: UserService,
    private auth: AuthenticateService,
    private statistics: StatisticsService,
    private metaService: MetaService,
    private shared: GlobalService
  ) {

  }



  async ngOnInit() {
    this.user = this.auth.account;
    this.domain = window.location.origin;

    let account = this.auth.account;
    this.user_id = account.role == 'admin' ? this.shared.user_management.user_id : account.id;
    this.generateLink();

    if (this.user_id !== this.user.id) {
      let userAccount = await this.userService.get(this.user_id);
      this.user = userAccount.data;
    }
    /**
     * Generate months, years
     */
    const now = new Date();
    this.generateTimes(10);

    let resp = await this.userService.getF1Commissions();
    if (resp.error) {
      return toastr.error('List commission failed', resp.error.message);
    }
    this.commissions = resp.data;
    this.commissions.map(comission => {
      if (comission.type == "referral") {
        ++this.referral;
      }
      if (comission.type == "commission_deposit") {
        ++this.deposit;
      }
      this.total_commission += comission.total_ctu;
    })
    this.reloadTable();
    console.log('total_commission ::', this.total_commission);
    this.dataChange.emit(this.total_commission);

  }

  ngAfterViewInit() {
    this.loadStatistics();
  }


  generateTimes(fromMonth) {
    let now = new Date();
    let thisMonth = now.getUTCMonth() + 1;
    let thisYear = now.getUTCFullYear();
    this.months = Array.from({ length: thisMonth - fromMonth + 1 }).map((_, m) => fromMonth + m);
    this.years = Array.from({ length: thisYear - 2017 + 1 }).map((_, y) => 2017 + y);

    this.selectedMonth = thisMonth;
    this.selectedYear = thisYear;
  }

  async getUserList() {

    let users = await this.userService.getListFromUserTitleHistory({ user_id: this.user_id, from_month: this.selectedMonth, to_month: this.selectedMonth });

    this.users = users;

  }

  async loadHistory() {
    this.isLoading = true;
    await this.getUserList();
  }

  async loadStatistics() {
    let now = new Date();
    let thisWeekDate = utils.getThisWeek(now)[0];
    let lastWeek = utils.getThisWeek(new Date(now.getTime() - 7 * 86400 * 1000));
    let thisMonthDate = new Date(now);
    thisMonthDate.setDate(1);
    thisMonthDate.setHours(0);
    thisMonthDate.setMinutes(0);
    thisMonthDate.setSeconds(0);

    let list_times = [...lastWeek, ...[thisWeekDate, now], ...[thisMonthDate, now]];
    let timesTitle = ['Last Week', 'This Week', 'This Month'];

    Promise.all([this.metaService.getPackagesConfig(), this.statistics.list({ list_times, user_id: this.user_id })])
      .then(resps => {
        this.packagesConfig = resps[0].data;
        let statisticsResp = resps[1];
        if (statisticsResp.error) {
          return toastr.error(statisticsResp.error.message, 'Get statistics failed');
        }

        let statisticsData = statisticsResp.data;

        this.statisticsData = statisticsData.map((arr, index) => {
          arr.sort((a, b) => Number(a.package_name) < Number(b.package_name));
          let data = this.packagesConfig.map(p => {
            let found = arr.find(d => Number(d.package_name) == p.price);
            return Object.assign({ count: 0, total: 0 }, found || {});
          });

          let total = arr.reduce((sum, next) => sum + Number(next.package_name) * Number(next.count), 0);

          return {
            title: timesTitle[index],
            list: data,
            total_value: total
          };
        });

      });
  }

  onChangeYear(year) {
    if (year == 2017) {
      return this.generateTimes(10);
    }

    this.generateTimes(1);
  }

  generateLink() {
    let data = {
      referral: this.user.username,
      created_at: Date.now()
    };

    //this.registerLink = `${this.domain}/register?${data.branch}=${data.referral}`;
    this.registerLink = `${this.domain}/?ref=${data.referral}`;
  }

  notifyCopied() {
    toastr.success('Copied');
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
