import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExchangeComponent } from './exchange/exchange.component';
import {exchangeRoutes} from './exchange.route';
import { RouterModule } from '@angular/router';
import { SharedComponents } from "app/shared-components/shared-components.module";
import { DataTablesModule } from 'angular-datatables';
import { ExchangeService, RateStatisticService, TradeService } from 'app/shared-services/api/exchange.service';
import {SharedModule} from 'app/shared-modules/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedComponents,
    DataTablesModule,
    SharedModule,
    RouterModule.forRoot(exchangeRoutes)
  ],
  declarations: [ExchangeComponent],
  providers: [
    ExchangeService,
    RateStatisticService,
    TradeService
  ]
})
export class ExchangeModule { }
