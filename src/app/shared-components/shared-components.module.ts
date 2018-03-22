import { NgModule, forwardRef } from "@angular/core";
import { CommonModule, DecimalPipe } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { SummernoteEditorComponent } from "app/shared-components/summernote-editor/summernote-editor.component";
import { ImageService } from "app/shared-services/api/image.service";
import { PanelItemsComponent } from "app/shared-components/panel-items/panel-items.component";
import { RouterModule } from "@angular/router";
import { UserAutocompleteComponent } from './user-autocomplete/user-autocomplete.component';
import { SharedModule } from "app/shared-modules/shared.module";
import { WalletDetailComponent } from './wallet-detail/wallet-detail.component';

import { BuySellCTUFormComponent } from './buy-sell-ctu-form/buy-sell-ctu-form.component';
import { LiveOrdersComponent } from './live-orders/live-orders.component';
import { DataTablesModule } from 'angular-datatables';
import { PanelExchangeComponent } from './panel-exchange/panel-exchange.component';
import { ChartExchangeComponent } from './chart-exchange/chart-exchange.component';
import { OrderExchangeHistoryComponent } from './order-exchange-history/order-exchange-history.component';
import { TradeHistoryComponent } from './trade-history/trade-history.component';
import { WithdrawComponent } from "app/shared-components/withdraw/withdraw.component";
import { VerifyAccountComponent } from "./verify-account/verify-account.component";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { BrowserModule } from "@angular/platform-browser";
import { LogoutComponent } from './logout/logout.component';
import { BountyProgramComponent } from './bounty-program/bounty-program.component';

declare var require: any;
@NgModule(
  {
    declarations: [
      SummernoteEditorComponent,
      PanelItemsComponent,
      UserAutocompleteComponent,
      WalletDetailComponent,
      BuySellCTUFormComponent,
      LiveOrdersComponent,
      PanelExchangeComponent,
      ChartExchangeComponent,
      OrderExchangeHistoryComponent,
      TradeHistoryComponent,
      WithdrawComponent,
      VerifyAccountComponent,
      LogoutComponent,
      BountyProgramComponent
    ],
    imports: [
      RouterModule,
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      SharedModule,
      DataTablesModule,
      NgxDatatableModule
    ],
    providers: [
      ImageService,
      DecimalPipe
    ],
    exports: [
      SummernoteEditorComponent,
      PanelItemsComponent,
      UserAutocompleteComponent,
      BuySellCTUFormComponent,
      LiveOrdersComponent,
      PanelExchangeComponent,
      ChartExchangeComponent,
      OrderExchangeHistoryComponent,
      TradeHistoryComponent,
      WithdrawComponent,
      VerifyAccountComponent,
      BountyProgramComponent
    ]
  }
)
export class SharedComponents { }
