import { Component, OnInit, Inject, OnDestroy } from "@angular/core";
import {AuthenticateService} from "../shared-services/authenticate.service";
import {HttpService} from "../shared-services/http.service";
import {Router} from "@angular/router";
import { Subject } from "rxjs/Subject";
import { TicketService } from "app/shared-services/api/ticket.service";
import { GlobalService } from "app/shared-services/global.service";
import { SocketService } from "app/shared-services/socket.service";
import { LayoutService } from "app/shared-services/menu.service";

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],  
})
export class AdminComponent implements OnInit, OnDestroy {

  account: any;
  $destroy = new Subject();

  constructor(
    private authenService: AuthenticateService,
    private http: HttpService,
    private router: Router,
    private socketService: SocketService,
    private ticketService: TicketService,
    private shared: GlobalService,
    private layoutService: LayoutService
  ) {    
    this.account = authenService.account;
    this.layoutService.setFooter(true);
    this.layoutService.setHeader(true);
    this.layoutService.setPanel(false);
    this.layoutService.setSidebar(true);
  }  

  async ngOnInit() {
    this.authenService
    .change
    .takeUntil(this.$destroy)
    .subscribe((auth: AuthenticateService) =>  {
      if (!auth) return;
      this.socketService.initSocket(auth.token);
      this.socketSetup();
    });
  }

  private socketSetup() {
    
    this.socketService
    .fromEvent('TOKEN_EXPIRED')
    .takeUntil(this.$destroy)
    .subscribe( data => {
      toastr.warning('TOKEN EXPIRED');
      this.signOut();
    });

    this.socketService
    .fromEvent('TICKET_CREATED')
    .takeUntil(this.$destroy)
    .subscribe( (resp:any) => {      
      toastr.info(resp.data.title, 'NEW TICKET');
    });

    this.socketService
    .fromEvent('TICKET_REPLY_CREATED')
    .takeUntil(this.$destroy)
    .subscribe( (resp:any) => {
      if (this.shared.currentTicket == resp.data.ticket_id) return;
      toastr.info(`New reply from ticket #${resp.data.ticket_id}`, 'NEW REPLY');
    });
  }

  ngOnDestroy() {    
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
    this.socketService.disconnect();
  }

  signOut() {
    this.authenService.clear();
    this.router.navigateByUrl("/login");
  }
}
