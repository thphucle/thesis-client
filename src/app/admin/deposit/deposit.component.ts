import { Component, OnInit, ViewChild } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { DepositService } from 'app/shared-services/api/deposit.service';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.scss']
})
export class DepositComponent implements OnInit {
  rows = [];
  @ViewChild(DatatableComponent) table: DatatableComponent;
  limitOptions = [25, 30, 40, 50, 100];
  currencies = ['all', 'bitcoin', 'bitdeal'];
  ticker = '';
  pagination = {
    total: 0,
    page: 0,
    perpage: 0
  };

  filterPromise: Promise<any>;
  summary = {
    sum: 0
  };

  filterForm: FormGroup;

  constructor(
    protected fb: FormBuilder,
    protected depositService: DepositService
  ) { }

  ngOnInit() {
    this.filterForm = this.fb.group({
      'username': [''],
      'currency': ['all'],
      'limit': [50],
      'from_date': [],
      'to_date': []
    });

    this.filterForm.get('currency').valueChanges
    .subscribe(val => {
      if (val == 'bitdeal') {
        this.ticker = 'CTU';
      }

      if (val == 'bitcoin') {
        this.ticker = 'BTC';
      }
    });

    this.filter();
  }

  async filter(p = {}) {
    let filterData = this.filterForm.value;
    let params = {
      username: filterData.username,
      currency: filterData.currency !== 'all' ? filterData.currency : null,
      from_date: filterData.from_date && filterData.from_date.getTime(),
      to_date: filterData.to_date && filterData.to_date.getTime(),
      page: 0,
      perpage: filterData.limit
    };

    params = Object.assign(params, p);

    this.filterPromise = this.depositService.list(params);
    let rs = await this.filterPromise;
    if (rs.error) {
      return toastr.error(rs.error.message, 'Load deposit failed');
    }

    this.pagination.page = params.page;
    this.pagination.perpage = params.perpage;
    this.pagination.total = rs.total;
    this.summary.sum = rs.sum;
    this.rows = rs.data;
  }

  setPage({offset}) {
    this.pagination.page = offset;
    this.filter({page: offset});
  }

  onDateChange(date, _) {
    console.log("Date ",date, _);
    if (_ == 'from') {
      this.filterForm.get('from_date').setValue(date)
    }

    if (_ == 'to') {
      this.filterForm.get('to_date').setValue(date)
    }
  }
}
