import { Component, OnInit } from '@angular/core';
import { MetaService, MetaKey } from 'app/shared-services/api/meta.service';

@Component({
  selector: 'app-meta-config',
  templateUrl: './meta-config.component.html',
  styleUrls: ['./meta-config.component.scss']
})
export class MetaConfigComponent implements OnInit {
  ctuUsd:number;

  data:any = {
    bounty: 0,
    referral: 0
  };

  updateMetaReq: Promise<any>;

  constructor(
    protected metaService: MetaService
  ) { }

  async ngOnInit() {
    /*this.metaService.getExchange(MetaKey.CTU_USD, false)
    .then(resp => {
      this.ctuUsd = resp;
    });*/

    let listMetas = await this.metaService.list();
    listMetas.data.forEach(meta => {
      if (this.data[meta.key] !== undefined) {
        let value = meta.value;

        if (['ico_start_time', 'ico_end_time'].indexOf(meta.key) > -1) {
          value = new Date(value);
        }

        this.data[meta.key] = value;
      }
    });
  }

  inputStartTimeChange(_:any) {
    this.data.ico_end_time = new Date(this.data.ico_start_time.getTime() + 1 * 60 * 60 * 1000);
  }

  async update() {
    let icoOpenTime = {
      start: this.data.ico_start_time,
      end: this.data.ico_end_time
    };

    if (icoOpenTime.start > icoOpenTime.end) {
      return toastr.error('Promotion start time must be less than end time');
    }

    let data = [
      {
        key: 'bounty',
        value: this.data.bounty
      },
      {
        key: 'referral',
        value: this.data.referral
      },
      {
        key: 'ico_open_time',
        value: icoOpenTime
      }
    ];

    this.updateMetaReq = this.metaService.updateMetas(data);
    let rs = await this.updateMetaReq;

    if (rs.error) {
      return toastr.error(rs.error.message, 'Update failed');
    }

    toastr.success('Update meta successfully');
    this.metaService.clearCache();
  }

}
