import { Injectable } from '@angular/core';
import { AService } from 'app/shared-services/api/aservice.service';
import { HttpService } from 'app/shared-services/http.service';
import { SpinnerService } from 'app/shared-modules/spinner-module/spinner.service';

@Injectable()
export class StatisticsService extends AService{

  constructor(http: HttpService, spinnerService: SpinnerService) { 
    super('statistics', http, spinnerService);
  }

  ticketStat() {
    let url = `${this.resource}/ticket`;
    return this.http.get(url).toPromise();
  }

  dashboardStat() {    
    let url = `${this.resource}/dashboard`;
    return this.http.get(url).toPromise();
  }

  adminDashboardStat() {
    let url = `${this.resource}/admin-dashboard`;
    return this.http.get(url).toPromise();
  }

  icoStat(times: Date[]) {    
    return this.get('ico', {times});
  }

}
