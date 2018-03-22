import { CommonModule } from '@angular/common';
import { NgModule } from "@angular/core";
import { TicketListComponent } from "app/shared-modules/ticket/ticket-list/ticket-list.component";
import { TicketCreateComponent } from "app/shared-modules/ticket/ticket-create/ticket-create.component";
import { TicketEditComponent } from "app/shared-modules/ticket/ticket-edit/ticket-edit.component";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { SharedModule } from "app/shared-modules/shared.module";
import { MainPipe } from 'app/shared-pipes';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    MainPipe
  ],
  declarations: [
    TicketListComponent,
    TicketCreateComponent,
    TicketEditComponent
  ],
  exports: [
    TicketListComponent,
    TicketCreateComponent,
    TicketEditComponent
  ]
})
export class TicketModule{}