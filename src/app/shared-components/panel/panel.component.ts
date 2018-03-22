import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthenticateService } from 'app/shared-services/authenticate.service';
import { Router } from '@angular/router';
import { IcoPackageService } from 'app/shared-services/api/ico-package.service';
import Utils from "app/shared-classes/utils";
import { MetaService, MetaKey } from 'app/shared-services/api/meta.service';
import { Subject } from 'rxjs/Subject';
import { SocketService } from 'app/shared-services/socket.service';


@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss']
})
export class PanelComponent implements OnInit, OnDestroy {
  user:any = {};
  balance:any = {
    usd: 0,
    btc: 0,
    ctu: 0
  };

  ctuUsd;
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
    this.initToggle();
    // this.balance = Object.assign(this.balance, this.user.balance);
    // this.freezeBdl = this.user.freezeBdl;

    // this.auth
    // .change
    // .takeUntil(this.$destroy)
    // .subscribe((auth: AuthenticateService) => {
    //   if (!auth) return;
      
    //   this.balance = Object.assign(this.balance, auth.account.balance);
    //   this.freezeBdl = auth.account.freezeBdl;
    // });

    // this.socketService
    // .fromEvent('RATE_CTU_USD')
    // .takeUntil(this.$destroy)
    // .subscribe((resp: any) => {
    //   if (resp.error) {
    //     return toastr.error(resp.error.message);
    //   }

    //   let rate = Number(resp.data);
    //   this.ctuUsd = rate;
    // });

    // this.metaService.getExchange(MetaKey.CTU_USD)
    // .then(resp => {
    //   this.ctuUsd = resp;
    // });

    // this.metaService
    // .icoOpenTimeChange
    // .takeUntil(this.$destroy)
    // .subscribe(eventData => {
    //   if (eventData == undefined) return;

    //   let {status, openTime} = eventData;
    //   this.isOpeningIco = status;

    //   if (status !== 1) return;

    //   let now = new Date();
    //   let start = now;
    //   let timeout = (openTime.start.getTime() - now.getTime())/1000;

    //   this.countDownIntervalId = setInterval(() => {        

    //       let countDown = Utils.getTimeInObject(timeout, start, () => {        
    //         this.isOpeningIco = 2;
    //         clearInterval(this.countDownIntervalId);
    //       });

    //       this.countDown = countDown;
    //     }, 1000);
    //   });

    
  }

  ngOnDestroy() {
    console.log("panel destroy");
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  private initToggle() {
    let $toggle = $('.navbar-toggler');

    $toggle.click(function () {
      let isOpen = $('html').hasClass('nav-open');
      if (isOpen) {
        $('html').removeClass('nav-open');

        $('.close-layer').remove();
        setTimeout(function () {
          $toggle.removeClass('toggled');
        }, 400);
      } else {
        setTimeout(function () {
          $toggle.addClass('toggled');
        }, 430);
        
        let $layer = $('<div class="close-layer"></div>');        
        $layer.appendTo("body");

        setTimeout(function () {
          $layer.addClass('visible');
        }, 100);

        $layer.click(function () {
          $('html').removeClass('nav-open');
          $layer.removeClass('visible');

          setTimeout(function () {
            $layer.remove();
            $toggle.removeClass('toggled');
          }, 400);
        });

        $('html').addClass('nav-open');
      }      
    });
  }

  signOut() {
    console.log('sign Out');
    $('html').removeClass('nav-open');
    this.auth.clear();
    this.router.navigate(['/']);
  }

}
