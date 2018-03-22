import { Component, OnInit, OnDestroy } from '@angular/core';
import { IcoPackageService } from 'app/shared-services/api/ico-package.service';
import { GlobalService } from 'app/shared-services/global.service';
import { Subject } from 'rxjs/Subject';
import { MetaService } from 'app/shared-services/api/meta.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-ico',
  templateUrl: './user-ico.component.html',
  styleUrls: ['./user-ico.component.scss']
})
export class UserIcoComponent implements OnInit, OnDestroy {
  rows: any[] = [];
  user;
  icoPackagesConfig;
  addIcoForm: FormGroup;
  
  promise: Promise<any>;
  private $destroy = new Subject();
  constructor(
    protected fb: FormBuilder,
    protected icoPackageService: IcoPackageService,
    protected shared: GlobalService,
    protected metaService: MetaService
  ) { }

  ngOnInit() {
    this.addIcoForm = this.fb.group({
      ico_package: ['10000'],
      otp_code: ['', Validators.required]
    });

    this.shared.user_management
    .change
    .takeUntil(this.$destroy)
    .subscribe(user => {
      if (!user) return;
      this.user = user;
    });
    this.loadIcoPackagesConfig();
    this.loadUserIco();
  }

  ngOnDestroy() {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  async loadIcoPackagesConfig() {
    this.metaService.getIcoPackagesConfig()
    .then(icoPackagesConfigRs => {
      if (icoPackagesConfigRs.error) {
        return toastr.error(icoPackagesConfigRs.error.message, 'Load Promotion packages config failed');
      }
  
      this.icoPackagesConfig = icoPackagesConfigRs.data;
    });
  }

  async loadUserIco() {
    let params = {
      user_id: this.user.id      
    };

    let resp = await this.icoPackageService.list(params);
    if (resp.error) {
      return toastr.error('List ico packages failed', resp.error.message);
    }

    this.rows = resp.data;
  }

  async addIcoPackage() {
    let user = this.user;
    let formData = this.addIcoForm.value;
    let {otp_code, ico_package} = formData;    

    if (!user) {
      return toastr.error('Please choose a user');
    }

    this.promise = this.icoPackageService.manualCreate(user.id,ico_package, otp_code);
    let rs = await this.promise;
    if (rs.error) {
      return toastr.error(rs.error.message, 'Manual add Promotion package failed');
    }

    this.rows.push(rs.data);    
    return toastr.success('Add success');
  }

}
