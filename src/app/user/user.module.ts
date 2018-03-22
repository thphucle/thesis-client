import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {NotfoundComponent} from "../shared-components/notfound/notfound.component";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";
import { WindowRef, Constants } from "app/shared-services/global.service"
import { DataTablesModule } from 'angular-datatables';
import { ClipboardModule } from 'ngx-clipboard';
import {SharedModule} from 'app/shared-modules/shared.module';

import { UserComponent } from './user.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NetworkComponent } from './network/network.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthGuard } from '../shared-services/guards/auth.guard';
import { ReferralComponent } from './referral/referral.component';
import { QRCodeModule } from 'angular2-qrcode';
import { CommissionComponent } from './commission/commission.component';
import { PasswordResetComponent } from "app/password-reset/password-reset.component";
import { PasswordForgotComponent } from "app/password-forgot/password-forgot.component";

import { TokenService, CommissionService, WalletService } from "app/shared-services/api/commission.service";
import { TokenComponent } from './token/token.component';
import { TransactionComponent } from './transaction/transaction.component';
import { SupportComponent } from './support/support.component';
import { TicketReplyService, TicketService } from "app/shared-services/api/ticket.service";
import { TicketModule } from "app/shared-modules/ticket/ticket-module";
import {ticketRouting} from "app/shared-modules/ticket/ticket-route"
import { SharedComponents } from "app/shared-components/shared-components.module";
import { MainPipe } from "app/shared-pipes";
import { FaqComponent } from './faq/faq.component';
import { StatisticsService } from "app/shared-services/api/statistics.service";
import { WithdrawService } from "app/shared-services/api/withdraw.service";
import { SocketService } from "app/shared-services/socket.service";
import { DepositHistoryComponent } from './deposit-history/deposit-history.component';
import { DepositService } from "app/shared-services/api/deposit.service";
import { SpinnerModule } from "app/shared-modules/spinner-module/spinner.module";
import { SpinnerService } from "app/shared-modules/spinner-module/spinner.service";
import { MenuService, LayoutService } from "app/shared-services/menu.service";
import { IcoPackageService } from "app/shared-services/api/ico-package.service";
import { IcoComponent } from "app/user/ico/ico.component";
import { WalletDetailComponent } from "app/shared-components/wallet-detail/wallet-detail.component";
import { VerifyComponent } from './verify/verify.component';
import { IdentityRequestService } from "app/shared-services/api/identity-request.service";
import { WalletComponent } from './wallet/wallet.component';
import { BountyComponent } from './bounty/bounty.component';
import { BountyService } from "../shared-services/api/bounty.service";


const userRoutes = [
  {
    path: 'user/reset-password/:password_type/:username/:salt',
    component: PasswordResetComponent
  },
  {
    path: 'user/forgot-password/:password_type',
    component: PasswordForgotComponent
  },
  {
    path: 'user/login',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'user',
    canActivate: [AuthGuard],
    component: UserComponent,
    children: [
      {path: 'transaction', component: TransactionComponent},
      // {path: 'commission', component: CommissionComponent},
      // {path: 'token', component: TokenComponent},
      // {path: 'ico', component: IcoComponent},
      {path: 'dashboard', component: DashboardComponent},
      {path: 'profile', component: ProfileComponent},
      //{path: 'network', component: NetworkComponent},
      {path: 'verify', component: VerifyComponent},
      {path: 'bounty', component: BountyComponent},
      {
        path: 'wallet',
        children: [
          {
            path: '',
            component: WalletComponent
          },
          {
            path: ':walletName',
            component: WalletDetailComponent
          }
        ]
      },
      {path: 'faq', component: FaqComponent},
      {
        path: 'support', component: SupportComponent,
        children: [
          ...ticketRouting
        ]
      },
      {path: '**', component: NotfoundComponent},
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(userRoutes),
    QRCodeModule,
    DataTablesModule,
    ClipboardModule,
    SharedModule,
    SharedComponents,
    MainPipe,
    TicketModule
  ],
  exports: [
    DashboardComponent,
    NetworkComponent,
    UserComponent,
    CommissionComponent,
    TokenComponent,
    TransactionComponent,
    DepositHistoryComponent,
  ],
  declarations: [
    DashboardComponent,
    ProfileComponent,
    NetworkComponent,
    UserComponent,
    ReferralComponent,
    CommissionComponent,
    TokenComponent,
    TransactionComponent,
    SupportComponent,
    FaqComponent,
    DepositHistoryComponent,
    IcoComponent,
    VerifyComponent,
    WalletComponent,
    BountyComponent
  ],
  providers: [
    WindowRef,
    Constants,
    AuthGuard,
    TokenService,
    CommissionService,
    WalletService,
    TicketService,
    TicketReplyService,
    StatisticsService,
    WithdrawService,
    DepositService,
    SpinnerService,
    MenuService,
    LayoutService,
    IcoPackageService,
    IdentityRequestService,
    BountyService
  ]
})
export class UserModule { }
