import { AService } from './aservice.service'
import { ImageService } from './image.service'
import { ShopService } from './shop.service'
import { MetaService } from './meta.service'
import { UploadService } from './aupload.service'
import { ProductService } from './product.service'
import { UserService } from './user.service'
import { CommissionService } from './commission.service'
import {TicketService, TicketReplyService} from './ticket.service'
import { Injectable } from '@angular/core';
import { HttpService } from 'app/shared-services/http.service';
import { WithdrawService } from 'app/shared-services/api/withdraw.service';

export default {
  AService,
  UploadService,
  MetaService,
  ImageService,
  ProductService: ProductService,
  UserService,
  CommissionService,
  ShopService,
  TicketService,
  TicketReplyService,
  WithdrawService
}

