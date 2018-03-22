import {TicketListComponent} from './ticket-list/ticket-list.component'
import {TicketEditComponent} from './ticket-edit/ticket-edit.component'
import {TicketCreateComponent} from './ticket-create/ticket-create.component'
import { RouterModule, Route } from "@angular/router";
import { NgModule } from "@angular/core/src/core";


export const ticketRouting = [
  {
    path: 'create',
    component: TicketCreateComponent
  },
  {
    path: '',
    component: TicketListComponent,
    children: [
      {path: ':id', component: TicketEditComponent}
    ]
  }
];

