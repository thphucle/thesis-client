import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { WalletName } from 'app/shared-services/api/commission.service';

@Injectable()
export class GlobalService {
  public branch = new Branch();
  public user_management = new UserManagement();

  public currentTicket = -1;  
  
  constructor() { }  
}

export class Branch {
  private _list = [];
  private _current:number;
  private _eventChange = new EventEmitter<number>();  
  
  constructor(list?: Array<any>) {
    if (list && list.length) {
      this.list = list;
    }
    
  }

  get list() {
    return this._list;
  }

  set list(list: Array<any>) {
    this._list = list;
    this.current = this._list[0].id;
  }

  set current(id: number) {    
    this._current = id;
    this._eventChange.emit(id);
  }

  get current() {
    return this._current;
  }

  onChange(cb:any) {
    return this._eventChange.subscribe(cb);
  }  

}

export class UserManagement {
  public user_id;
  private _user;
  private changeBh = new BehaviorSubject<any>(false);
  public change = this.changeBh.asObservable();

  constructor() {}

  set user(val: any) {
    if (!val) return;
    this._user = val;
    this.changeBh.next(val);
  }

  get user() { return this._user; }


}


function _window() : any {
   // return the global native browser window object
   return window;
}
  
@Injectable()
export class WindowRef {
   get nativeWindow() : any {
      return _window();
   }
}

@Injectable()
export class Constants {
  public PHONE_PREFIX_NATIONS = [
    {"value": "+1", "name": "United States"},
    {"value": "+93", "name": "Afghanistan"},
    {"value": "+355", "name": "Albania"},
    {"value": "+213", "name": "Algeria"},
    {"value": "+1-684", "name": "American Samoa"},
    {"value": "+376", "name": "Andorra"},
    {"value": "+244", "name": "Angola"},
    {"value": "+1-264", "name": "Anguilla"},
    {"value": "+672", "name": "Antarctica"},
    {"value": "+1-268", "name": "Antigua and Barbuda"},
    {"value": "+54", "name": "Argentina"},
    {"value": "+374", "name": "Armenia"},
    {"value": "+297", "name": "Aruba"},
    {"value": "+61", "name": "Australia"},
    {"value": "+43", "name": "Austria"},
    {"value": "+994", "name": "Azerbaijan"},
    {"value": "+1-242", "name": "Bahamas"},
    {"value": "+973", "name": "Bahrain"},
    {"value": "+880", "name": "Bangladesh"},
    {"value": "+1-246", "name": "Barbados"},
    {"value": "+375", "name": "Belarus"},
    {"value": "+32", "name": "Belgium"},
    {"value": "+501", "name": "Belize"},
    {"value": "+229", "name": "Benin"},
    {"value": "+1-441", "name": "Bermuda"},
    {"value": "+975", "name": "Bhutan"},
    {"value": "+591", "name": "Bolivia"},
    {"value": "+387", "name": "Bosnia and Herzegovina"},
    {"value": "+267", "name": "Botswana"},
    {"value": "+55", "name": "Brazil"},
    {"value": "+246", "name": "British Indian Ocean Territory"},
    {"value": "+1-284", "name": "British Virgin Islands"},
    {"value": "+673", "name": "Brunei"},
    {"value": "+359", "name": "Bulgaria"},
    {"value": "+226", "name": "Burkina Faso"},
    {"value": "+257", "name": "Burundi"},
    {"value": "+855", "name": "Cambodia"},
    {"value": "+237", "name": "Cameroon"},
    {"value": "+1", "name": "Canada"},
    {"value": "+238", "name": "Cape Verde"},
    {"value": "+1-345", "name": "Cayman Islands"},
    {"value": "+236", "name": "Central African Republic"},
    {"value": "+235", "name": "Chad"},
    {"value": "+56", "name": "Chile"},
    {"value": "+86", "name": "China"},
    {"value": "+61", "name": "Christmas Island"},
    {"value": "+61", "name": "Cocos Islands"},
    {"value": "+57", "name": "Colombia"},
    {"value": "+269", "name": "Comoros"},
    {"value": "+682", "name": "Cook Islands"},
    {"value": "+506", "name": "Costa Rica"},
    {"value": "+385", "name": "Croatia"},
    {"value": "+53", "name": "Cuba"},
    {"value": "+599", "name": "Curacao"},
    {"value": "+357", "name": "Cyprus"},
    {"value": "+420", "name": "Czech Republic"},
    {"value": "+243", "name": "Democratic Republic of the Congo"},
    {"value": "+45", "name": "Denmark"},
    {"value": "+253", "name": "Djibouti"},
    {"value": "+1-767", "name": "Dominica"},
    {"value": "+1-809, 1-829, 1-849", "name": "Dominican Republic"},
    {"value": "+670", "name": "East Timor"},
    {"value": "+593", "name": "Ecuador"},
    {"value": "+20", "name": "Egypt"},
    {"value": "+503", "name": "El Salvador"},
    {"value": "+240", "name": "Equatorial Guinea"},
    {"value": "+291", "name": "Eritrea"},
    {"value": "+372", "name": "Estonia"},
    {"value": "+251", "name": "Ethiopia"},
    {"value": "+500", "name": "Falkland Islands"},
    {"value": "+298", "name": "Faroe Islands"},
    {"value": "+679", "name": "Fiji"},
    {"value": "+358", "name": "Finland"},
    {"value": "+33", "name": "France"},
    {"value": "+689", "name": "French Polynesia"},
    {"value": "+241", "name": "Gabon"},
    {"value": "+220", "name": "Gambia"},
    {"value": "+995", "name": "Georgia"},
    {"value": "+49", "name": "Germany"},
    {"value": "+233", "name": "Ghana"},
    {"value": "+350", "name": "Gibraltar"},
    {"value": "+30", "name": "Greece"},
    {"value": "+299", "name": "Greenland"},
    {"value": "+1-473", "name": "Grenada"},
    {"value": "+1-671", "name": "Guam"},
    {"value": "+502", "name": "Guatemala"},
    {"value": "+44-1481", "name": "Guernsey"},
    {"value": "+224", "name": "Guinea"},
    {"value": "+245", "name": "Guinea-Bissau"},
    {"value": "+592", "name": "Guyana"},
    {"value": "+509", "name": "Haiti"},
    {"value": "+504", "name": "Honduras"},
    {"value": "+852", "name": "Hong Kong"},
    {"value": "+36", "name": "Hungary"},
    {"value": "+354", "name": "Iceland"},
    {"value": "+91", "name": "India"},
    {"value": "+62", "name": "Indonesia"},
    {"value": "+98", "name": "Iran"},
    {"value": "+964", "name": "Iraq"},
    {"value": "+353", "name": "Ireland"},
    {"value": "+44-1624", "name": "Isle of Man"},
    {"value": "+972", "name": "Israel"},
    {"value": "+39", "name": "Italy"},
    {"value": "+225", "name": "Ivory Coast"},
    {"value": "+1-876", "name": "Jamaica"},
    {"value": "+81", "name": "Japan"},
    {"value": "+44-1534", "name": "Jersey"},
    {"value": "+962", "name": "Jordan"},
    {"value": "+7", "name": "Kazakhstan"},
    {"value": "+254", "name": "Kenya"},
    {"value": "+686", "name": "Kiribati"},
    {"value": "+383", "name": "Kosovo"},
    {"value": "+965", "name": "Kuwait"},
    {"value": "+996", "name": "Kyrgyzstan"},
    {"value": "+856", "name": "Laos"},
    {"value": "+371", "name": "Latvia"},
    {"value": "+961", "name": "Lebanon"},
    {"value": "+266", "name": "Lesotho"},
    {"value": "+231", "name": "Liberia"},
    {"value": "+218", "name": "Libya"},
    {"value": "+423", "name": "Liechtenstein"},
    {"value": "+370", "name": "Lithuania"},
    {"value": "+352", "name": "Luxembourg"},
    {"value": "+853", "name": "Macau"},
    {"value": "+389", "name": "Macedonia"},
    {"value": "+261", "name": "Madagascar"},
    {"value": "+265", "name": "Malawi"},
    {"value": "+60", "name": "Malaysia"},
    {"value": "+960", "name": "Maldives"},
    {"value": "+223", "name": "Mali"},
    {"value": "+356", "name": "Malta"},
    {"value": "+692", "name": "Marshall Islands"},
    {"value": "+222", "name": "Mauritania"},
    {"value": "+230", "name": "Mauritius"},
    {"value": "+262", "name": "Mayotte"},
    {"value": "+52", "name": "Mexico"},
    {"value": "+691", "name": "Micronesia"},
    {"value": "+373", "name": "Moldova"},
    {"value": "+377", "name": "Monaco"},
    {"value": "+976", "name": "Mongolia"},
    {"value": "+382", "name": "Montenegro"},
    {"value": "+1-664", "name": "Montserrat"},
    {"value": "+212", "name": "Morocco"},
    {"value": "+258", "name": "Mozambique"},
    {"value": "+95", "name": "Myanmar"},
    {"value": "+264", "name": "Namibia"},
    {"value": "+674", "name": "Nauru"},
    {"value": "+977", "name": "Nepal"},
    {"value": "+31", "name": "Netherlands"},
    {"value": "+599", "name": "Netherlands Antilles"},
    {"value": "+687", "name": "New Caledonia"},
    {"value": "+64", "name": "New Zealand"},
    {"value": "+505", "name": "Nicaragua"},
    {"value": "+227", "name": "Niger"},
    {"value": "+234", "name": "Nigeria"},
    {"value": "+683", "name": "Niue"},
    {"value": "+850", "name": "North Korea"},
    {"value": "+1-670", "name": "Northern Mariana Islands"},
    {"value": "+47", "name": "Norway"},
    {"value": "+968", "name": "Oman"},
    {"value": "+92", "name": "Pakistan"},
    {"value": "+680", "name": "Palau"},
    {"value": "+970", "name": "Palestine"},
    {"value": "+507", "name": "Panama"},
    {"value": "+675", "name": "Papua New Guinea"},
    {"value": "+595", "name": "Paraguay"},
    {"value": "+51", "name": "Peru"},
    {"value": "+63", "name": "Philippines"},
    {"value": "+64", "name": "Pitcairn"},
    {"value": "+48", "name": "Poland"},
    {"value": "+351", "name": "Portugal"},
    {"value": "+1-787, 1-939", "name": "Puerto Rico"},
    {"value": "+974", "name": "Qatar"},
    {"value": "+242", "name": "Republic of the Congo"},
    {"value": "+262", "name": "Reunion"},
    {"value": "+40", "name": "Romania"},
    {"value": "+7", "name": "Russia"},
    {"value": "+250", "name": "Rwanda"},
    {"value": "+590", "name": "Saint Barthelemy"},
    {"value": "+290", "name": "Saint Helena"},
    {"value": "+1-869", "name": "Saint Kitts and Nevis"},
    {"value": "+1-758", "name": "Saint Lucia"},
    {"value": "+590", "name": "Saint Martin"},
    {"value": "+508", "name": "Saint Pierre and Miquelon"},
    {"value": "+1-784", "name": "Saint Vincent and the Grenadines"},
    {"value": "+685", "name": "Samoa"},
    {"value": "+378", "name": "San Marino"},
    {"value": "+239", "name": "Sao Tome and Principe"},
    {"value": "+966", "name": "Saudi Arabia"},
    {"value": "+221", "name": "Senegal"},
    {"value": "+381", "name": "Serbia"},
    {"value": "+248", "name": "Seychelles"},
    {"value": "+232", "name": "Sierra Leone"},
    {"value": "+65", "name": "Singapore"},
    {"value": "+1-721", "name": "Sint Maarten"},
    {"value": "+421", "name": "Slovakia"},
    {"value": "+386", "name": "Slovenia"},
    {"value": "+677", "name": "Solomon Islands"},
    {"value": "+252", "name": "Somalia"},
    {"value": "+27", "name": "South Africa"},
    {"value": "+82", "name": "South Korea"},
    {"value": "+211", "name": "South Sudan"},
    {"value": "+34", "name": "Spain"},
    {"value": "+94", "name": "Sri Lanka"},
    {"value": "+249", "name": "Sudan"},
    {"value": "+597", "name": "Suriname"},
    {"value": "+47", "name": "Svalbard and Jan Mayen"},
    {"value": "+268", "name": "Swaziland"},
    {"value": "+46", "name": "Sweden"},
    {"value": "+41", "name": "Switzerland"},
    {"value": "+963", "name": "Syria"},
    {"value": "+886", "name": "Taiwan"},
    {"value": "+992", "name": "Tajikistan"},
    {"value": "+255", "name": "Tanzania"},
    {"value": "+66", "name": "Thailand"},
    {"value": "+228", "name": "Togo"},
    {"value": "+690", "name": "Tokelau"},
    {"value": "+676", "name": "Tonga"},
    {"value": "+1-868", "name": "Trinidad and Tobago"},
    {"value": "+216", "name": "Tunisia"},
    {"value": "+90", "name": "Turkey"},
    {"value": "+993", "name": "Turkmenistan"},
    {"value": "+1-649", "name": "Turks and Caicos Islands"},
    {"value": "+688", "name": "Tuvalu"},
    {"value": "+1-340", "name": "U.S. Virgin Islands"},
    {"value": "+256", "name": "Uganda"},
    {"value": "+380", "name": "Ukraine"},
    {"value": "+971", "name": "United Arab Emirates"},
    {"value": "+44", "name": "United Kingdom"},
    {"value": "+598", "name": "Uruguay"},
    {"value": "+998", "name": "Uzbekistan"},
    {"value": "+678", "name": "Vanuatu"},
    {"value": "+379", "name": "Vatican"},
    {"value": "+58", "name": "Venezuela"},
    {"value": "+84", "name": "Vietnam"},
    {"value": "+681", "name": "Wallis and Futuna"},
    {"value": "+212", "name": "Western Sahara"},
    {"value": "+967", "name": "Yemen"},
    {"value": "+260", "name": "Zambia"},
    {"value": "+263", "name": "Zimbabwe"}
  ]

  public COLOR_NAMES = [
    "#29BB9C",
    "#39CA74",
    "#3A99D8",
    "#9A5CB4",
    "#F0C330",
    "#F19B2C",
    "#E47E30",
    "#E54D42",
    "#95A5A6",
    "#7F8C8D",
    "#35495D",
    "mediumvioletred",
    "midnightblue",
    "mintcream",
    "mistyrose",
    "moccasin",
    "blanchedalmond",
    "blue",
    "blueviolet",
    "brown",
    "burlywood",
    "cadetblue",
    "chartreuse",
    "chocolate",
    "coral",
    "cornflowerblue",
    "cornsilk",
    "crimson",
    "cyan",
    "darkblue",
    "darkcyan",
    "darkgoldenrod",
    "darkgray",
    "darkgreen",
    "darkgrey",
    "darkkhaki",
    "darkmagenta",
    "darkolivegreen",
    "darkorange",
    "darkorchid",
    "darkred",
    "darksalmon",
    "darkseagreen",
    "darkslateblue",
    "darkslategray",
    "darkslategrey",
    "darkturquoise",
    "darkviolet",
    "deeppink"
  ];

  public WALLET_NAMES = [
    {
      name: WalletName.BTC,
      title: 'BTC',
      sticker: 'BTC'
    },
    {
      name: WalletName.CTU_1,
      title: 'CTU 1',
      sticker: 'CTU'
    },
    {
      name: WalletName.CTU_2,
      title: 'CTU 2',
      sticker: 'CTU'
    },
    {
      name: WalletName.CTU_3,
      title: 'CTU 3',
      sticker: 'CTU'
    },
    {
      name: WalletName.USD_1,
      title: 'USD 1',
      sticker: 'USD'
    },
    {
      name: WalletName.USD_2,
      title: 'USD 2',
      sticker: 'USD'
    }    
  ];

  public WALLET_NAMES_HASH = this.WALLET_NAMES.reduce((hash, next) => {hash[next.name]=next; return hash}, {});
}

