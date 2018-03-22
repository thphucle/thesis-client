import { Component, OnInit } from '@angular/core';
import { AuthenticateService } from 'app/shared-services/authenticate.service';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {
  user:any;
  private $destroy = new Subject();
  constructor(
    protected auth: AuthenticateService,
  ) { }

  ngOnInit() {
    this.signOut();
  }
  signOut() {
    this.auth.clear();
    location.href = 'https://beta.contractium.io';
  }
}
