import {Injectable} from '@angular/core';
import {HttpService} from "../http.service";
import 'rxjs/add/operator/toPromise';
import { AService } from 'app/shared-services/api/aservice.service';
import util from 'app/shared-classes/utils';


@Injectable()
export class BountyService extends AService{

  constructor(http: HttpService) {
    super('bounty', http);
  }
  getAllBounty() {
    return this.http.get(`bounty/get-all-bounty`).toPromise();
  }
  
}
