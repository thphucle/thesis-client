import { Injectable } from '@angular/core';
import { AuthenticateService } from 'app/shared-services/authenticate.service';
// tslint:disable-next-line:import-blacklist
import { Subject } from 'rxjs';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class MenuService {
  private menu = {
    'user': [
      {
        'icon': 'ti-home',
        'text': 'Dashboard',
        'path': 'dashboard'
      },
      /*{
        'icon': 'ti-home',
        'text': 'Dashboard',
        'path': 'dashboard'
      },*/
      // {
      //   'icon': 'fa fa-handshake-o',
      //   'text': 'Promotion',
      //   'path': 'ico'
      // },
      /*{
        'icon': 'fa fa-dropbox',
        'text': 'Sharing',
        'path': 'token'
      },*/
      /*{
        'icon': 'fa fa-credit-card',
        'text': 'Wallet',
        'path': 'wallet'
      },*/
      {
        'icon': 'ti-stats-up',
        'text': 'CTU Exchange',
        'path': 'exchange',
        isAbsolute: true
      },
      {
        'icon': 'ti-exchange-vertical',
        'text': 'Buy CTU',
        'path': 'transaction'
      },
      /*{
        'icon': 'fa fa-money',
        'text': 'Commission',
        'path': 'commission'
      },*/
      /*{
        'icon': 'ti-share',
        'text': 'Referral',
        'path': 'network'
      },*/
      {
        'icon': 'ti-user',
        'text': 'Profile',
        'path': 'profile'
      },
      {
        'icon': 'ti-id-badge',
        'text': 'KYC REGISTER',
        'path': 'verify'
      },
      {
        'icon': 'ti-shortcode',
        'text': 'BOUNTY',
        'path': 'bounty'
      }
      // {
      //   'icon': 'fa fa-info',
      //   'text': 'Support',
      //   'path': 'support'
      // },
    ],

    'admin': [
      {
        'icon': 'ti-home',
        'text': 'Dashboard',
        'path': 'dashboard'
      },
      {
        'icon': 'ti-link',
        'text': 'User Management',
        'path': 'user-management'
      },
      /*{
        'icon': 'ti-info-alt',
        'text': 'Support',
        'path': 'support'
      },*/
      {
        'icon': 'ti-id-badge',
        'text': 'Verify Account',
        'path': 'verify-account'
      },
      {
        'icon': 'ti-control-shuffle',
        'text': 'Promotion',
        'path': 'ico'
      },
      {
        'icon': 'ti-dropbox',
        'text': 'Token',
        'path': 'token'
      },
      {
        'icon': 'ti-exchange-vertical',
        'text': 'Deposit',
        'path': 'deposit'
      },
      {
        'icon': 'ti-shortcode',
        'text': 'Commission',
        'path': 'commission'
      },
      /*{
        'icon': 'ti-shift-left',
        'text': 'Withdraw',
        'path': 'withdraw'
      },*/
      {
        'icon': 'ti-settings',
        'text': 'Meta Config',
        'path': 'meta'
      },
      {
        'icon': 'ti-user',
        'text': 'Profile',
        'path': 'profile'
      },
      {
        'icon': 'ti-share',
        'text': 'Staff',
        'path': 'staff'
      }
    ],
    'support': [
      {
        'icon': 'ti-info-alt',
        'text': 'Support',
        'path': 'support'
      },
      {
        'icon': 'ti-id-badge',
        'text': 'Verify Account',
        'path': 'verify-account'
      },
    ]
  };

  private roles = ['user', 'admin', 'support'];
  private rolesRoute: any = {};
  activeRole = 'user';
  activeRoutes: any[] = [];

  private activeRoutesChange = new Subject<any[]>();

  constructor(
    auth: AuthenticateService,
  ) {
    this.roles.forEach(role => {
      let begin = role;      

      this.rolesRoute[role] = this.menu[role].map(m => {

        if (m.isAbsolute) {
          m['url'] = `${m.path}`;
        } else {
          m['url'] = `/${begin}/${m.path}`;
        }
        return m;
      });
    });

    auth.subscribe(_ => {
      if (!_.account) {
        return;
      }
      this.setActiveRoutes(_.account.role);
    });

    if (auth.account) {
      this.setActiveRoutes(auth.account.role);
    }
  }

  setActiveRoutes(role: string) {
    this.activeRole = role;
    this.activeRoutes = this.rolesRoute[this.activeRole];
    this.activeRoutesChange.next(this.activeRoutes);
  }

  onActiveRoutesChange() {
    return this.activeRoutesChange.asObservable().share();
  }

  getBeginRoute(role: string) {
    return role;
  }
}


export class LayoutService {
  private configs = {
    sidebar: false,
    header: false,
    panel: false,
    footer: false,
    panel_exchange: false,
    background_url: ''
  };

  private changeSubject = new BehaviorSubject(Object.assign({}, this.configs));
  public change = this.changeSubject.asObservable().share();

  constructor() { 
    
  }

  setPanelExchange(show: boolean) {
    this._set('panel_exchange', show);
  }

  setSidebar(show: boolean) {
    this._set('sidebar', show);
  }

  setHeader(show: boolean) {
    this._set('header', show);
  }
  setPanel(show: boolean) {
    this._set('panel', show);
  }
  setFooter(show: boolean) {
    this._set('footer', show);
  }

  setBackgroundImage(url: string) {    
    this._set('background_url', url);
  }

  private _set(key: string, value: any) {
    this.configs[key] = value;
    this.broadcast();
  }

  private broadcast() {
    this.changeSubject.next(Object.assign({}, this.configs));
  }
}
