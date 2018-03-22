import { Component, OnInit } from '@angular/core';
import { StatisticsService } from 'app/shared-services/api/statistics.service';
import Utils from "app/shared-classes/utils";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  stat: any;
  icoStatistics: any[] = [];

  constructor(
    protected statService: StatisticsService
  ) { }

  async ngOnInit() {
    this.loadIcoStat();
    let statRs = await this.statService.adminDashboardStat();
    if (statRs.error) {
      return toastr.error(statRs.error.message, 'Load admin dashboard statistic failed');
    }

    this.stat = statRs.data;
  }

  async loadIcoStat() {
    let now = new Date();
    let thisWeekDate = Utils.getThisWeek(now)[0];
    let lastWeek = Utils.getThisWeek(new Date(now.getTime() - 7 * 86400 * 1000));
    let thisMonthDate = new Date(now);
    thisMonthDate.setDate(1);
    thisMonthDate.setHours(0);
    thisMonthDate.setMinutes(0);
    thisMonthDate.setSeconds(0);        

    let list_times = [...Utils.getBoundOfDate(now), ...lastWeek, ...[thisWeekDate, now], ...[thisMonthDate, now]];
    let timesTitle = ['Today', 'Last Week', 'This Week', 'This Month'];
    let rs = await this.statService.icoStat(list_times);
    if (rs.error) {
      return toastr.error(rs.error.message, 'Load Promotion statistic failed');
    }

    let stats = rs.data;
    this.icoStatistics = stats.map((stat, index) => {
      return {...stat, time: timesTitle[index]};
    });    
  }

}
