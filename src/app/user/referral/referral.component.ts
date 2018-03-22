import { Component, OnInit } from '@angular/core';
import { AuthenticateService } from '../../shared-services/authenticate.service'

@Component({
  selector: 'app-referral',
  templateUrl: './referral.component.html',
  styleUrls: ['./referral.component.scss']
})
export class ReferralComponent implements OnInit {
  user: any;
  href: string;
  domain: string;  
  constructor(auth: AuthenticateService) {
    this.user = auth.account;
    this.domain = 'https://bitdeal.co.in';
    this.href = '/register?ref=' + this.user.username;    
  }

  ngOnInit() {
  }

}
