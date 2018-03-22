import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { IdentityRequestService } from 'app/shared-services/api/identity-request.service';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthenticateService } from 'app/shared-services/authenticate.service';

@Component({
  selector: 'app-verify-account',
  templateUrl: './verify-account.component.html',
  styleUrls: ['./verify-account.component.scss']
})
export class VerifyAccountComponent implements OnInit,OnDestroy {

  pagination = {
    total: 0,
    page: 0,
    perpage: 25
  };

  @ViewChild(DatatableComponent) table: DatatableComponent;  

  dataTableFilter = {
    fromDate: null,
    toDate: null
  };

  filterForm: FormGroup;

  rows;
  currentIdent:any;
  note = '';
  currentIdentImage: any = {};

  private $destroy = new Subject();
  isShowConfirmDialog = false;
  isShowViewImage = false;
  isShowError = false;
  currentStatus = '';
  errorMessage = '';

  promiseReject: Promise<any>;
  promiseVerify: Promise<any>;
  filterPromise: Promise<any>;

  role;
  constructor(
    protected auth: AuthenticateService,
    protected fb: FormBuilder,
    protected identService: IdentityRequestService,
    protected cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.filterForm = this.fb.group({
      username: [''],
      status: ['pending'],
      from_date: [],
      to_date: []
    });

    this.filterForm.controls
    .username.valueChanges
    .subscribe(value => {
      if (value) {
        this.filterForm.controls.status.setValue('');
        this.filterForm.controls.from_date.setValue(null);
        this.filterForm.controls.to_date.setValue(null);
      }
    });

    this.list();

    this.auth.change
    .takeUntil(this.$destroy)
    .subscribe((auth: AuthenticateService) => {
      if (!auth) return;
      this.role = auth.account.role;
    });
  }

  ngOnDestroy() {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
    // $.fn['dataTable'].ext.search.pop();
  }

  filterDate(filter) {
    if (filter) {
      this.dataTableFilter.fromDate = filter.from && filter.from.getTime();
      this.dataTableFilter.toDate = filter.to && filter.to.getTime();
    } else {
      this.dataTableFilter.fromDate = this.dataTableFilter.toDate = undefined;
    }
    
    this.filter();

    // this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
    //   dtInstance.draw();
    // });
  }  

  async list(p: any = {}) {    
    let params = this.filterForm.value;
    params.from_date = params.from_date && params.from_date.getTime();
    params.to_date = params.to_date && params.to_date.getTime();

    params = Object.assign(params, p, this.pagination);

    let promise = this.identService.list(params);
    promise.then(rs => {
      if (rs.error) {
        return toastr.error(rs.error.message, 'Load Identitys verification failed');
      }
  
      this.pagination.total = rs.total;
      this.rows = rs.data;
    });

    return promise;
  }

  async filter() {
    this.pagination.page = 0;
    this.filterPromise = this.list();
  }

  setPage({offset}) {
    this.pagination.page = offset;
    this.list();
  }

  chooseButton(status: string) {
    this.currentStatus = status;
    this.filter();
  }

  viewImageClick(ident, identImage) {
    this.currentIdent = ident;
    this.currentIdentImage = identImage;
    this.isShowViewImage = true;
  }

  verifyBtnClick(ident) {
    this.currentIdent = ident;
    this.verify(ident);
  }

  rejectBtnClick(ident) {
    this.currentIdent = ident;
    this.isShowConfirmDialog = true;    
  }

  closeBtnClick() {
    this.isShowConfirmDialog = false;
  }

  viewImageModalChange() {
    this.currentIdent = {
      note: ''
    };
    this.currentIdentImage = {};
  }

  rejectModalChange() {
    this.currentIdent = {
      note: ''
    };
    this.currentIdentImage = {};
  }

  errorDialogChange(visible: boolean) {
    if (visible) return;
    this.errorMessage = '';
  }

  async reject(ident) {
    this.promiseReject = this.identService.reject(ident.id, this.note);
    let rs = await this.promiseReject;
    if (rs.error) {
      return toastr.error(rs.error.message);
    }

    ident.status = rs.data.status;
    this.isShowConfirmDialog = false;
    toastr.success('Success');
  }

  async verify(ident) {
    this.promiseVerify = this.identService.verify(ident.id);
    let rs = await this.promiseVerify;
    if (rs.error) {      
      this.errorMessage = rs.error.message;
      return this.isShowError = true;
    }

    ident.status = rs.data.status;
    toastr.success('Success');
  }

}
