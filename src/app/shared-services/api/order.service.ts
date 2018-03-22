import { Injectable } from '@angular/core';
import { AService } from "app/shared-services/api/aservice.service";
import { HttpService } from "app/shared-services/http.service";
import { SocketService } from 'app/shared-services/socket.service';


@Injectable()
export class OrderService extends AService {

  constructor(http: HttpService, private socket: SocketService) { 
    super('order', http);     
    
  }  

}

export enum ORDER_EVENT {
  CREATED = 'ORDER_CREATED',
  UPDATED = 'ORDER_UPDATED'
};

export enum ORDER_STATUS {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  PAID = 'paid',
  CANCELLED = 'cancelled'
};

export const ORDER_STATUSES = [ORDER_STATUS.DRAFT, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PAID, ORDER_STATUS.CANCELLED];
