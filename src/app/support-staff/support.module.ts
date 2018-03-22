import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupportComponent } from './support/support.component';
import { SharedModule } from 'app/shared-modules/shared.module';
import { Routes, RouterModule } from '@angular/router';
import { NotfoundComponent } from 'app/shared-components/notfound/notfound.component';
import { ticketRouting } from 'app/shared-modules/ticket/ticket-route';
import { SupportStaffComponent } from './support-staff/support-staff.component';
import { TicketService, TicketReplyService } from 'app/shared-services/api/ticket.service';
import { SocketService } from 'app/shared-services/socket.service';
import { StatisticsService } from 'app/shared-services/api/statistics.service';
import { IdentityRequestService } from '../shared-services/api/identity-request.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FormsModule } from '@angular/forms';
import { SharedComponents } from '../shared-components/shared-components.module';
import { VerifyAccountComponent } from 'app/shared-components/verify-account/verify-account.component';

const routes: Routes = [
  {
    path: 'support',
    component: SupportStaffComponent,
    children: [
      {
        path: 'support', component: SupportComponent,
        children: [          
          ...ticketRouting
        ]
      },
      {
        path: '', redirectTo: 'verify-account', pathMatch: 'full'
      },
      {
        path: 'verify-account', component: VerifyAccountComponent
      },
      {path: '**', component: NotfoundComponent}
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    SharedComponents,
    NgxDatatableModule,
    FormsModule,
    RouterModule.forRoot(routes)
  ],
  declarations: [
    SupportComponent,
    SupportStaffComponent
  ],
  providers: [
    TicketService,
    TicketReplyService,
    StatisticsService,    
    SocketService,
    IdentityRequestService
  ]
})
export class SupportModule { }
