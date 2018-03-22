import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UserService } from 'app/shared-services/api/user.service';
import { AutocompleteSetting } from 'app/shared-modules/autocomplete/autocomplete.component';

@Component({
  selector: 'app-user-autocomplete',
  templateUrl: './user-autocomplete.component.html',
  styleUrls: ['./user-autocomplete.component.scss']
})
export class UserAutocompleteComponent implements OnInit {
  autocompleteSetting: AutocompleteSetting = {
    textField: 'username',
    valueField: 'username'
  };
  
  userList:[any];
  @Output() change = new EventEmitter<any>();

  constructor(
    protected userService: UserService
  ) { }

  ngOnInit() {
    this.loadUserList();
  }

  async loadUserList() {
    let usersRs = await this.userService.list({page: 0, perpage: 999999}); // get all
    if (usersRs.error) {
      return toastr.error(usersRs.error.message, 'Load users failed');
    }
  
    this.userList = usersRs.data;    
  }

  selectUser(user) {
    this.change.emit(user);
  }

}
