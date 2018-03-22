import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthenticateService } from "app/shared-services/authenticate.service";
import { TokenService } from "app/shared-services/api/commission.service";
import { DatatableComponent } from "@swimlane/ngx-datatable/release";

@Component({
  selector: 'app-token',
  templateUrl: './token.component.html',
  styleUrls: ['./token.component.scss']
})
export class TokenComponent implements OnInit {  
  tokens = [];
  original = [];
  currentSearchText = '';
  limitOptions = [25, 30, 40, 50, 100];
  limit = this.limitOptions[1];

  @ViewChild(DatatableComponent) table: DatatableComponent;

  constructor(
    private tokenService: TokenService,
    private auth: AuthenticateService
  ) { }

  async ngOnInit() {
    await this.list();    
  }

  async list() {    
    
    try {
      let params = Object.assign({
        page: 0,
        perpage: 9999999
      });
      let resp = await this.tokenService.list(params);
      if (resp.error) {
        return toastr.error('List tokens failed', resp.error.message);
      }

      this.tokens = resp.data;
      this.original = resp.data;      
      
    } catch (error) {
      return toastr.error('Unknown Error', error.message);
    }
  }

  filterByUsername(text: string) {
    this.currentSearchText = text;
    let filtered = [];
    if (!text) {
      filtered = this.original;
    } else {
      filtered = this.original.filter(token => {
        let fields = Object.keys(token);
        for (let f of fields) {
          let str = '';
          str = token[f];

          if (typeof token[f] == 'object') {
            str = JSON.stringify(token[f]);
          }

          if (str.toString().toLowerCase().indexOf(text) > -1) {
            return true;
          }
        }
        
        return false;
      });
    }
    this.tokens = filtered;
    this.table.offset = 0;    
  }

  changeLimit(event) {    
    this.limit = Number(event.target.value);
    this.table.limit = this.limit;
    this.table.pageSize = this.limit;
    
  }

}
