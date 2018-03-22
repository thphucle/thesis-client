import { AService } from "app/shared-services/api/aservice.service";
import {Injectable} from '@angular/core';
import { HttpService } from "app/shared-services/http.service";
import Utils from 'app/shared-classes/utils';
import List from "app/shared-classes/list";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/share';
import { Observable } from "rxjs/Observable";
import { SocketService } from "app/shared-services/socket.service";
import { AuthenticateService } from "app/shared-services/authenticate.service";
import { Subject } from "rxjs/Subject";
import { SpinnerService } from "app/shared-modules/spinner-module/spinner.service";


@Injectable()
export class TicketService extends AService {

  private updateTicket = new Subject();
  private _updateTicketOvservable = this.updateTicket.asObservable().share();
  private createTicket = new Subject();
  private _createTicketOvservable = this.createTicket.asObservable().share();
  
  constructor(
    http: HttpService, 
    private socketService: SocketService,
    private auth: AuthenticateService,
    spinnerService: SpinnerService
  ) {
    super('ticket', http, spinnerService);    
    this.registerSocketEvents();
    
  }

  private registerSocketEvents() {
    console.log("Register socket ticketservice");
    this.socketService
    .fromEvent('TICKET_REPLY_CREATED')
    .subscribe( (resp:any) => {
      this.updateTicket.next({
        id: resp.data.ticket_id,
        status: resp.data.Ticket.status,
        TicketReplies: [resp.data]
      });
    });

    this.socketService
    .fromEvent('TICKET_CREATED')
    .subscribe((resp: any) => {
      console.log("Ticket service TICKET_CREATED");
      let ticket = resp.data;
      ticket.from.avatar = ticket.from.avatar || '/assets/images/ava.png';
      this.createTicket.next(ticket);
    });
  }

  async list(params?:object) {
    let tickets = await super.list(params);

    if (!tickets.error) {
      tickets.data = tickets.data.map(ticket => {
        ticket.from.avatar = ticket.from.avatar || '/assets/images/ava.png';
        return ticket;
      });

    }
    
    return tickets;
  }

  async update (id:string | number, data) {
    let res = await super.update(id, data);

    if (!res.error) {
      let ticket = res.data;
      ticket.from.avatar = ticket.from.avatar || '/assets/images/ava.png';      
      this.updateTicket.next(ticket);
    }
    return res;
  }

  /**
   * This function for update view
   * @param ticket_id 
   * @param status 
   */
  changeStatus(ticket_id: number, status: string) {
    this.updateTicket.next({
      id: ticket_id,
      status
    });
  }

  public fromEvent(eventName:string) {
    switch (eventName) {
      case 'update': return this._updateTicketOvservable;
      case 'create': return this._createTicketOvservable;
      default: throw 'Not found event';
    }
  }
}

@Injectable()
export class TicketReplyService extends AService {
  
  private ticketReplyCreated = new Subject();
  private ticketReplyCreatedObservable = this.ticketReplyCreated.asObservable().share();

  constructor(http: HttpService, private socketService: SocketService) {
    super('ticket-reply', http);
    
  }

  fromEvent(event:string) {
    return this.socketService.fromEvent(event)
    .map( (resp:any) => resp.data);
  }
}
