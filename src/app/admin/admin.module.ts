import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {NotfoundComponent} from "../shared-components/notfound/notfound.component";
import {AdminComponent} from "./admin.component";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";
import { ClipboardModule } from 'ngx-clipboard';
import { AuthGuard, AuthAdminGuard } from '../shared-services/guards/auth.guard'
import { DashboardComponent } from './dashboard/dashboard.component';
import { SupportComponent } from './support/support.component';
import { SharedModule } from "app/shared-modules/shared.module";
import {TicketModule} from "app/shared-modules/ticket/ticket-module"
import {ticketRouting} from "app/shared-modules/ticket/ticket-route";
import { TransactionComponent } from './transaction/transaction.component';
import { TokenComponent } from './token/token.component';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { CommissionComponent } from './commission/commission.component';
import { AddTokenComponent } from "app/admin/add-token/add-token.component";
import { WithdrawComponent } from "app/admin/withdraw/withdraw.component";

import {userAdminRouting} from "app/admin/user-admin-route";
import { UserManagementComponent } from "app/admin/user-management/user-management.component";
import { UserListComponent } from './user-management/user-list/user-list.component';
import { UserComponent } from './user-management/user/user.component';
import { TicketService, TicketReplyService } from "app/shared-services/api/ticket.service";
import { WindowRef, Constants } from "app/shared-services/global.service";
import { TokenService, CommissionService, WalletService } from "app/shared-services/api/commission.service";
import { StatisticsService } from "app/shared-services/api/statistics.service";
import { WithdrawService } from "app/shared-services/api/withdraw.service";
import { SocketService } from "app/shared-services/socket.service";
import { UserTitleComponent } from './user-title/user-title.component';
import { DataTablesModule } from "angular-datatables";
import { MetaConfigComponent } from './meta-config/meta-config.component';
import { SharedComponents } from "app/shared-components/shared-components.module";
import { UserWalletComponent } from './user-management/user-wallet/user-wallet.component';
import { QRCodeModule } from "angular2-qrcode";
import { UserProfileComponent } from './user-management/user-profile/user-profile.component';
import { AdminProfileComponent } from './admin-profile/admin-profile.component';
import { UserIcoComponent } from './user-management/user-ico/user-ico.component';
import { StaffComponent } from './staff/staff.component';
import { UserTokenComponent } from './user-management/user-token/user-token.component';
import { DepositComponent } from './deposit/deposit.component';
import { UserVerifyAccountComponent } from './user-management/user-verify-account/user-verify-account.component';
import { VerifyAccountComponent } from "app/shared-components/verify-account/verify-account.component";

const adminRoutes = [
  {
    path: 'admin/login', redirectTo: 'login', pathMatch: 'full'
  },
  {
    path: 'admin',
    canActivate: [AuthGuard, AuthAdminGuard],
    component: AdminComponent,
    children: [
      {
        path: 'support', component: SupportComponent,
        children: [
          ...ticketRouting
        ]
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'transaction',
        component: TransactionComponent
      },
      {
        path: 'token',
        component: TokenComponent
      },
      {
        path: 'deposit',
        component: DepositComponent
      },
      {
        path: 'commission',
        component: CommissionComponent
      },
      {
        path: 'withdraw',
        component: WithdrawComponent
      },
      {
        path: 'verify-account',
        component: VerifyAccountComponent
      },
      {
        path: 'user-management',
        component: UserManagementComponent,
        children: [
          {
            path: '',
            component: UserListComponent
          },
          {
            path: ':id',
            component: UserComponent,
            children: [
              ...userAdminRouting,
              {
                path: 'wallet-manage',
                component: UserWalletComponent,
                outlet: 'updatesection'
              },
              {
                path: 'profile-manage',
                component: UserProfileComponent,
                outlet: 'updatesection'
              },
              {
                path: 'ico-manage',
                component: UserIcoComponent,
                outlet: 'updatesection'
              },
              {
                path: 'lending-manage',
                component: UserTokenComponent,
                outlet: 'updatesection'
              },
              {
                path: 'kyc',
                component: UserVerifyAccountComponent,
                outlet: 'updatesection'
              }
            ]
          }
        ]
      },
      {
        path: 'meta',
        component: MetaConfigComponent
      },
      {
        path: 'profile',
        component: AdminProfileComponent
      },
      {
        path: 'staff',
        component: StaffComponent
      },
      {path: '**', component: NotfoundComponent},
    ]
  },

];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    TicketModule,
    DataTablesModule,
    NgxDatatableModule,
    SharedComponents,
    ClipboardModule,
    QRCodeModule,

    RouterModule.forChild(adminRoutes)
  ],
  declarations: [
    DashboardComponent,
    AdminComponent,
    NotfoundComponent,
    SupportComponent,
    TransactionComponent,
    TokenComponent,
    CommissionComponent,
    AddTokenComponent,
    WithdrawComponent,
    UserManagementComponent,
    UserListComponent,
    UserComponent,
    UserTitleComponent,
    MetaConfigComponent,
    UserWalletComponent,
    UserProfileComponent,
    AdminProfileComponent,
    UserIcoComponent,
    StaffComponent,
    UserTokenComponent,
    DepositComponent,
    UserVerifyAccountComponent
  ],
  providers: [
    WindowRef,
    Constants,
    AuthGuard,
    AuthAdminGuard,
    TokenService,
    CommissionService,
    WalletService,
    TicketService,
    TicketReplyService,
    StatisticsService,
    WithdrawService,
    SocketService
  ]
})
export class AdminModule {
}
