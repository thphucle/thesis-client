import { Component, OnInit } from '@angular/core';
import { UserService } from 'app/shared-services/api/user.service'
import { AuthenticateService } from 'app/shared-services/authenticate.service';
import { StatisticsService } from 'app/shared-services/api/statistics.service';
import { MetaService } from 'app/shared-services/api/meta.service';
import { GlobalService } from 'app/shared-services/global.service';
import { BountyService } from 'app/shared-services/api/bounty.service';

@Component({
  selector: 'app-bounty',
  templateUrl: './bounty.component.html',
  styleUrls: ['./bounty.component.scss']
})
export class BountyComponent implements OnInit {
  progess_percent = '40%';
  registration = [];
  sdk_program = [];
  social_program = [];
  bitcointalk = [];
  email = '';

  total_bounty_ctu = 0;
  commission_ctu = 0;
  bounty_register = 0;
  bounty_subscription = 0;
  bounty_kyc = 0;
  bounty_sdk = 0;
  bounty_social = 0;
  bounty_program = 0;
  bounty_bitcointalk = 0;
  bounty_community = 0

  user:any = {};
  updateUser:any = {};
  sdk:any = {};
  isProcessingBitcointalk = false;
  isProcessingSubscription = false;

  constructor(
    private userService: UserService,
    private bountyService: BountyService,
    private auth: AuthenticateService,
    private statistics: StatisticsService,
    private metaService: MetaService,
    private shared: GlobalService
  ) {
    this.init();
  }

  async ngOnInit() {

    let resp = await this.bountyService.getAllBounty();
    if (resp.error) {
      return toastr.error('List bounty failed', resp.error.message);
    }
    this.registration = resp.data.registration;
    this.sdk_program = resp.data.sdk_program;
    this.social_program = resp.data.social_program;
    this.bitcointalk = resp.data.bitcointalk;
    
    this.loadRegistrationBounty();
    this.loadBountySdk();
    this.loadBounty();
    this.loadProgressStatus();
    
  }

  init() {
    this.user = Object.assign({}, this.auth.account || {});
    this.updateUser = Object.assign({}, this.user);
  }

  dynamicLoadingProgressbar(start, end) {
    console.log('Start ::', start, end);
    var current_progress = start;
    let percent = 0;
    var interval = setInterval(function() {
        current_progress += 1;
        percent = current_progress/25000*100;
        console.log('Current ::', current_progress, percent);
        $('#bounty-progress-bar .progress-bar')
        .css("width", percent + "%")
        .text(current_progress + " CTU");
        if (current_progress >= end)
            clearInterval(interval);
    }, 10);
  }

  loadProgressStatus() {
    let old = this.total_bounty_ctu;
    this.total_bounty_ctu = this.commission_ctu + this.bounty_register + this.bounty_subscription + this.bounty_kyc + this.bounty_sdk +this.bounty_social + this.bounty_program + this.bounty_bitcointalk + this.bounty_community;
    let percent = this.total_bounty_ctu/25000*100 + '%';
    $('#bounty-progress-bar .progress-bar').css('width', percent);
    // this.dynamicLoadingProgressbar(old, this.total_bounty_ctu);
  }

  getCommission($event) {
    this.commission_ctu = $event;
    this.loadProgressStatus();
  }

  async loadRegistrationBounty() {
    let a = this.registration.find(r => r.key == 'register');
    let b = this.registration.find(r => r.key == 'subscription');
    let c = this.registration.find(r => r.key == 'kyc');
    if (a.Bounties.length) {
      this.bounty_register = a.Bounties[0].amount;
    }
    if (b.Bounties.length) {
      this.bounty_subscription = b.Bounties[0].amount;
    }
    if (c.Bounties.length) {
      this.bounty_kyc = c.Bounties[0].amount;
    }
  }
  getBountySdk(sdkBounty) {
    return sdkBounty.Bounties.length ? sdkBounty.Bounties[0].amount : 0; 
  }
  loadBountySdk() {
    this.sdk = {
      'fb_share' : this.getBountySdk(this.sdk_program.find(s => s.key == 'fb_share')),
      'tw_tweet' : this.getBountySdk(this.sdk_program.find(s => s.key == 'tw_tweet')),
      'li_share' : this.getBountySdk(this.sdk_program.find(s => s.key == 'li_share')),
      'gp_share' : this.getBountySdk(this.sdk_program.find(s => s.key == 'gp_share')),
      'tw_follow' : this.getBountySdk(this.sdk_program.find(s => s.key == 'tw_follow')),
      'tg_join' : this.getBountySdk(this.sdk_program.find(s => s.key == 'tg_join')),
      'fb_like' : this.getBountySdk(this.sdk_program.find(s => s.key == 'fb_like')),
      'tw_follow_ceo' : this.getBountySdk(this.sdk_program.find(s => s.key == 'tw_follow_ceo'))
    }
    Object.keys(this.sdk).map(k => {
      this.bounty_sdk += this.sdk[k];
    })
  }

  loadBounty() {
    let bounties_prog = [].concat(...this.social_program.map(bs => bs.Bounties));
    bounties_prog.forEach(b => {
      if (b.status == 'accepted') {
        this.bounty_program += b.amount;
      }
    })

    let bounties_bct = [].concat(...this.bitcointalk.map(bs => bs.Bounties));
    bounties_bct.forEach(b => {
      if (b.status == 'accepted') {
        this.bounty_bitcointalk += b.amount;
      }
    })
  }

  async save() {
    this.isProcessingBitcointalk = true;
    let data = new FormData();
    data.append('bct_username', this.updateUser.bct_username);
    data.append('bct_link', this.updateUser.bct_link);
    let resp = await this.userService.updateForm(this.updateUser.id, data);
    this.isProcessingBitcointalk = false;
    if (resp.error) {
      return toastr.error(resp.error.message, 'Update profile failed');
    }
    this.auth.updateInfo(this.auth.token, resp.data);
    this.init();
    toastr.success('Update Bitcointalk informations successfully');
  }

  updateBitcointalk() {
    this.save();
  }

  async addBountySubscribe() {
    let data = {
      type: 'registration', 
      key: 'subscription',
      status: 'accepted'
    }
    return await this.bountyService.create(data);
  }

  async emailSubscription() {
    if (!this.email) {
      return;
    }
    if(this.email != this.user.email) {
      return toastr.error('Your subscribed-email is different with your registered-email!')
    }
    this.isProcessingSubscription = true;
    let data = new FormData();
    data.append('subscribe','true');    
    let resp = await this.userService.updateForm(this.updateUser.id, data);
    this.isProcessingSubscription = false;
    if (resp.error) {
      return toastr.error(resp.error.message, 'Subscribe failed');
    }
    this.auth.updateInfo(this.auth.token, resp.data);
    this.init();
    /* Fake update ProgressStatus bar */
    this.bounty_subscription = 50;
    this.loadProgressStatus();
    this.addBountySubscribe();
    toastr.success('Subscribe successfully');
  }

  onSub() {
    this.emailSubscription();
  }
}
