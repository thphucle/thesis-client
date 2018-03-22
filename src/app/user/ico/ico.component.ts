import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { AuthenticateService } from 'app/shared-services/authenticate.service';
import { DepositService } from 'app/shared-services/api/deposit.service';
import { GlobalService } from 'app/shared-services/global.service';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { IcoPackageService } from 'app/shared-services/api/ico-package.service';
import { MetaService, MetaKey } from 'app/shared-services/api/meta.service';

@Component({
  selector: 'app-ico',
  templateUrl: './ico.component.html',
  styleUrls: ['./ico.component.scss']
})
export class IcoComponent implements OnInit, OnDestroy, AfterViewInit {

  page = {
    page: 0,
    total: 0,
    perpage: 99999
  };

  icoPackages = []; 
  icoPackagesConfig = [];
  currentPack;

  role: string;

  user_id:number;
  user:any = {};

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  
  dtOptions: DataTables.Settings = {
    "lengthMenu": [[25, 50, 100, -1], [25, 50, 100, "All"]],
    "responsive": true,
    "order": [[ 5, "desc" ]],
    "initComplete": () => {
     
      setTimeout(() => {        
        this.isShowTable = true;
      }, 500);
    }
  };

  dtTrigger = new Subject();
  isShowTable = false;

  dataTableFilter = {
    fromDate: null,
    toDate: null
  };

  isOpenIco;
  buyPackageReq;
  rate_btc_usd;

  timeoutId;

  private $destroy = new Subject();
  
  constructor(
    private auth: AuthenticateService,
    private icoPackageService: IcoPackageService,
    private shared: GlobalService,
    protected metaService: MetaService
  ) { }

  ngOnInit() {
    this.role = this.auth.account.role;
    this.user_id = this.auth.account.id;
    this.user = this.auth.account;
    
    if (this.role == 'admin') {
      this.user_id = this.shared.user_management.user_id;
    }

    this.metaService.getIcoPackagesConfig()
    .then(icoPackagesConfigRs => {
      if (icoPackagesConfigRs.error) {
        return toastr.error(icoPackagesConfigRs.error.message, 'Load Promotion packages config failed');
      }
  
      this.icoPackagesConfig = icoPackagesConfigRs.data;
    });

    this.metaService
    .icoOpenTimeChange
    .takeUntil(this.$destroy)
    .subscribe(eventData => {
      if (eventData == undefined) return;
      this.isOpenIco = eventData.status;
    });

    this.requestBTCRate();
    
  }

  ngOnDestroy() {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
    clearTimeout(this.timeoutId);
  }
  
  ngAfterViewInit() {
    this.setPage({offset: 0});
  }

  async setPage(pageData) {
    this.page.page = pageData.offset;
    await this.list();
  }

  async list() {
    
    try {
      let params = Object.assign({
        user_id: this.user_id,
      }, this.page);
      let resp = await this.icoPackageService.list(params);
      if (resp.error) {
        return toastr.error('List ico packages failed', resp.error.message);
      }

      this.icoPackages = resp.data;
      this.page.total = resp.total;
            
      this.reloadTable();
      
    } catch (error) {
      return toastr.error('Unknown Error', error.message);
    }
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

  async requestBTCRate() {
    try {
      let rate = await this.metaService.getExchange(MetaKey.BTC_USD, false);
      this.rate_btc_usd = rate;
      
      this.timeoutId = setTimeout(this.requestBTCRate.bind(this), 10*1e3);
    } catch (err) {
      toastr.error(err.message || "Can't get BTC rate", 'Error BTC Rate');
    }
  }

  async buyIcoPackage(packageName: string) {
    if (!packageName) {
      return toastr.warning('Please choose a package');
    }

    this.buyPackageReq = this.icoPackageService.create({package_name: packageName});
    let rs = await this.buyPackageReq;

    if (rs.error) {
      return toastr.error(rs.error.message, `Buy Promotion package $${packageName} failed`);
    }

    this.icoPackages.push(rs.data);
    this.reloadTable();
    let accountInfo = this.auth.account;
    accountInfo.balance.btc -= rs.data.usd / rs.data.rate_btc_usd;
    accountInfo.freezeBdl += rs.data.ctu*(1 + rs.data.bonus_rate/100);
    this.auth.updateInfo(this.auth.token, accountInfo);
    
    return toastr.success(`Buy Promotion package $${packageName} successfully`);
  }

}
