import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { TicketService, TicketReplyService } from "app/shared-services/api/ticket.service";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthenticateService } from "app/shared-services/authenticate.service";
import List from "app/shared-classes/list";
import { Subject } from "rxjs/Subject";
import { StatisticsService } from 'app/shared-services/api/statistics.service';

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.scss']
})
export class TicketListComponent implements OnInit, OnDestroy, AfterViewInit {

  tickets:any = [];
  ticketsList;
  ticket: any = {};
  currentTicketId:number; 
  currentFilterStatus = 'all';
  ticketStatus = ['new', 'replied', 'closed']; 
  private groupTickets = {
    new: [],
    replied: [],
    closed: []
  };

  stats:any = [];

  subscribes = [];
  userRole:string = 'user';
  private $destroy = new Subject();

  constructor(
    protected ticketService: TicketService,
    protected router: Router,
    protected activatedRoute: ActivatedRoute,
    protected statisticService: StatisticsService,
    auth: AuthenticateService
  ) {
    this.userRole = auth.account.role; 
    
  }

  async ngOnInit() {
    this.ticketService
    .fromEvent('create')
    .takeUntil(this.$destroy)
    .subscribe((ticket:any) => {      
      this.ticketsList.addFirst(ticket);      
      this.tickets = this.ticketsList.asArray();
    });

    this.ticketService
    .fromEvent('update')
    .takeUntil(this.$destroy)
    .subscribe( (ticket:any) => {
      if (!ticket) return;

      let updatedTicket = Object.assign({}, this.ticketsList.get(ticket.id), ticket);      
      this.ticketsList.deleteId(ticket.id);
      let tickets = this.ticketsList.asArray();
      
      updatedTicket.from.avatar = (updatedTicket.from.avatar && updatedTicket.from.avatar.thumbnail) || '/assets/images/ava.png';
      
      tickets.unshift(updatedTicket);
      this.tickets = tickets;
      this.ticketsList = new List(tickets);
    });
    
    this.loadStatistics();
  }

  ngAfterViewInit() {
    this.loadTickets();
  }

  async loadStatistics() {
    let statsReq = await this.statisticService.ticketStat();
    if (statsReq.error) {
      return toastr.error(statsReq.error.message, 'Load ticket statistics failed');
    }

    let stats = statsReq.data;    
    this.stats = stats;
    this.stats.push({status: 'all', total: this.stats.reduce((sum, next) => sum + next.total, 0)});
  }

  async filterStatus(status) {
    this.currentFilterStatus = status;
    if (status == 'all') {
      return this.loadTickets();
    }

    this.loadTickets(status);
  }

  ngOnDestroy() {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  async loadTickets(status = '') {    

    let ticketsResp = await this.ticketService.list({status});
    if (ticketsResp.error) {
      return toastr.error(ticketsResp.error.message, 'Load tickets failed');
    }

    let group = this.groupTickets;
    group = {
      new: [],
      replied: [],
      closed: []
    };

    let tickets = ticketsResp.data;
    tickets.forEach(t => {
      t.from.avatar = (t.from.avatar && t.from.avatar.thumbnail) || '/assets/images/ava.png';
      group[t.status].push(t)
    });

    if (this.userRole == 'admin') {
      tickets = group.new.concat(group.replied.concat(group.closed));    

    } else {
      tickets = group.replied.concat(group.new.concat(group.closed));    
      
    }
    this.ticketsList = new List(tickets);
    this.tickets = this.ticketsList.asArray();    
  }

}
