import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { BountyService } from 'app/shared-services/api/bounty.service'

@Component({
  selector: 'app-bounty-program',
  templateUrl: './bounty-program.component.html',
  styleUrls: ['./bounty-program.component.scss']
})
export class BountyProgramComponent implements OnInit {

  @Input() data: any;
  @Output() dataChange: EventEmitter<any> = new EventEmitter();
  url_input = '';
  promiseUploadUrl: Promise<any>;
  bounties = [];
  constructor(
    private bountyService: BountyService
  ) { }

  ngOnInit() {
    this.bounties = this.data.Bounties;
  }

  uploadBountyUrl() {
    let data = {
      url: this.url_input,
      bounty_program_id: this.data.id,
      type: this.data.type,
      key: this.data.key
    }
    return  this.bountyService.create(data);
  }

  async addRow() {
    if (this.url_input) {
      let duplicate = this.bounties.find(b => b.url == this.url_input);
      if (duplicate) {
        toastr.error('Duplicate url');
        return;
      }
      if (this.bounties.filter(b => b.status == "pending" || "accepted").length >= 20) {
        toastr.warning('This bounty program has reached the reservation at 20 records!');
        toastr.error('Your request is rejected!');
        return;
      };
      this.promiseUploadUrl = this.uploadBountyUrl();
      let rs = await this.promiseUploadUrl;
      if (rs.error) {
        toastr.error(rs.error.message)
        return;
      }
      this.bounties.unshift({
        amount: rs.data.amount,
        status: rs.data.status,
        url: rs.data.url,
        created_at: rs.data.created_at
      });
      /*This magic line code will update ngx-datatable*/
      this.bounties = [...this.bounties];
      /*End magic code*/
      this.url_input = '';
      this.data.Bounties = this.bounties;
      this.dataChange.emit(this.data);
    }
  }
  onEnter() { 
    this.addRow();
  }
}
