import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss']
})
export class UserInfoComponent implements OnInit {  
  info:any;

  constructor() { 
      
    
  }

  ngOnInit() {
    
  }
  
  @Input() set userData(data) {

    let defaultVal = {
      avatar: '',
      username: '',
      fullname: '',
      email: '',
      birthday: '',
      phone: '',
      gender: ''    
    };

    this.info = defaultVal;
    
    if (!data) {
      return;
    }

    Object.keys(defaultVal).forEach(key => this.info[key] = data[key] || defaultVal[key]);
  }

}
