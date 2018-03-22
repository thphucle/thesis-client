import { Injectable } from '@angular/core';
import { AService } from './aservice.service';
import {HttpService} from "../http.service";
import { Observable } from "rxjs/Observable";
import Utils from 'app/shared-classes/utils';

@Injectable()
export class ShopService extends AService {
  constructor(http: HttpService) {
    super('shop', http);
  }

  listUnverifyShop (params: any) {
    return this.http.get(`shop/list/unverify?${Utils.buildQueryString(params)}`).toPromise();
  }

  verifyShop (id: number) {
    return this.http.post(`shop/verify`, {shop_id: id}).toPromise();
  }
}

@Injectable()
export class BranchService extends AService {
  constructor(http: HttpService) {
    super('branch', http);
  }
}

@Injectable()
export class CampaignService extends AService {
  constructor(http: HttpService) {
    super('campaign', http);
  }

  getWithBranch(id:number, branchId:number) {
    return super.get(`campaign/${id}`, {branch_id: branchId});
  }

}

export enum CAMPAIGN_EVENT {
  CAMPAIGN_CREATED = 'CAMPAIGN_CREATED',
  CAMPAIGN_DELETED = 'CAMPAIGN_DELETED',
  CAMPAIGN_UPDATED = 'CAMPAIGN_UPDATED'
}
