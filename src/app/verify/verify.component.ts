import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss']
})
export class VerifyComponent implements OnInit {

  constructor(private route: ActivatedRoute, private router: Router) { }
  message = '';
  messsageHash = {
    not_found: 'Could not find user!',
    already: "This's not new account!",
    wrong: "Wrong verification  code!",
    expired: "Your verification code was expired!",
    success: "Your account was verified successfully."
  }

  ngOnInit() {
    var self = this;
    this.route
    .queryParams
    .subscribe(params => {
      console.log('params', params);
      let status = params['status'];
      self.message = this.messsageHash[status];
      if (!self.message) {
        self.message = this.messsageHash.wrong;
      }
    });
  }

}
