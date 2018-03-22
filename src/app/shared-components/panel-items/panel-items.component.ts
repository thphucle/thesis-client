import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthenticateService } from 'app/shared-services/authenticate.service';
import { Router } from '@angular/router';
import { IcoPackageService } from 'app/shared-services/api/ico-package.service';
import Utils from "app/shared-classes/utils";
import { MetaService, MetaKey } from 'app/shared-services/api/meta.service';
import { Subject } from 'rxjs/Subject';
import { SocketService } from 'app/shared-services/socket.service';


@Component({
  selector: 'app-panel-items',
  templateUrl: './panel-items.component.html',
  styleUrls: ['./panel-items.component.scss']
})
export class PanelItemsComponent implements OnInit, OnDestroy {
  user:any = {};
  balance:any = {
    usd1: 0,
    usd2: 0,
    btc: 0,
    ctu: 0,
    ctu1: 0,
    ctu2: 0
  };

  exchange;

  btcUsd;
  freezeBdl = 0.0;
  countDownIntervalId;
  countDown = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  };
  isOpeningIco; // 0, 1: waiting, 2: intime

  private $destroy = new Subject();

  constructor(
    protected auth: AuthenticateService,
    protected router: Router,
    protected icoPackageService: IcoPackageService,
    protected metaService: MetaService,
    protected socketService: SocketService
  ) { }

  async ngOnInit() {
    this.user = this.auth.account;
    
    this.balance = Object.assign(this.balance, this.user.balance);
    this.freezeBdl = this.balance.ctu3;

    this.auth
    .change
    .takeUntil(this.$destroy)
    .subscribe((auth: AuthenticateService) => {
      console.log("Auth Sub ", auth);
      if (!auth) return;
      
      this.balance = Object.assign(this.balance, auth.account.balance);
      this.freezeBdl = this.balance.ctu3;
    });        

    this.metaService.getTickerCTU()
    .then(resp => {
      this.exchange = resp.data;
    }); 

    this.metaService
    .icoOpenTimeChange
    .takeUntil(this.$destroy)
    .subscribe(eventData => {      
      
      if (eventData == undefined) return;

      let {status, openTime} = eventData;
      this.isOpeningIco = status;

      if (status !== 1) return;

      let now = new Date();
      let start = now;
      let timeout = (openTime.start.getTime() - now.getTime())/1000;

      this.countDownIntervalId = setInterval(() => {        

          let countDown = Utils.getTimeInObject(timeout, start, () => {        
            this.isOpeningIco = 2;
            clearInterval(this.countDownIntervalId);
          });

          this.countDown = countDown;
        }, 1000);
      });

    
  }

  ngOnDestroy() {
    console.log("panel destroy");
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  signOut() {
    this.auth.clear();
    this.router.navigate(['login']);
  }

}
