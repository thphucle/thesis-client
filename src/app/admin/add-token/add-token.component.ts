import { Component, OnInit } from '@angular/core';
import { MetaService } from 'app/shared-services/api/meta.service';
import { TokenService } from 'app/shared-services/api/commission.service';

@Component({
  selector: 'app-add-token',
  templateUrl: './add-token.component.html',
  styleUrls: ['./add-token.component.scss']
})
export class AddTokenComponent implements OnInit {
  usd:number = 500;
  tx_id:string = '';
  ctu_address:string = '';
  currency:string = 'bitdeal';
  isProcessing:boolean = false;

  packagesValue: number[] = [];

  constructor(
    private metaService: MetaService,
    private tokenService: TokenService
  ) { 
    this.init();
  }

  async ngOnInit() {
    let resp = await this.metaService.getPackagesConfig();
    if (resp.error) {
      return toastr.error(resp.error.message);
    }

    this.packagesValue = resp.data.map(pack => pack.price);
    this.usd = this.packagesValue[0];
    
  }

  private init() {    
    this.tx_id = '';
    this.ctu_address = '';
    this.usd = this.packagesValue[0];
  }

  async onSubmit() {
    let data = {
      usd: this.usd,
      tx_id: this.tx_id,
      ctu_address: this.ctu_address,
      currency: this.currency
    };

    this.isProcessing = true;
    let tokenCreateResp = await this.tokenService.create(data);
    this.isProcessing = false;
    
    if (tokenCreateResp.error) {
      return toastr.error(tokenCreateResp.error.message);
    }
    
    this.init();

    return toastr.success('Success');
  }

}
