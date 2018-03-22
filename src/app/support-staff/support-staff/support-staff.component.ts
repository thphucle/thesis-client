import { Component, OnInit, OnDestroy } from '@angular/core';
import { LayoutService } from 'app/shared-services/menu.service';
import { AuthenticateService } from 'app/shared-services/authenticate.service';
import { SocketService } from 'app/shared-services/socket.service';
import { Subject } from 'rxjs/Subject';
import { GlobalService } from 'app/shared-services/global.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-support-staff',
  templateUrl: './support-staff.component.html',
  styleUrls: ['./support-staff.component.scss']
})
export class SupportStaffComponent implements OnInit, OnDestroy {

  private $destroy = new Subject();
  constructor(
    protected layoutService: LayoutService,
    protected authService: AuthenticateService,
    protected socketService: SocketService,
    protected shared: GlobalService,
    protected router: Router
  ) { 
    layoutService.setHeader(true);
    layoutService.setSidebar(true);
    layoutService.setPanel(false);
    layoutService.setFooter(true);
  }

  async ngOnInit() {
    this.authService
    .change
    .takeUntil(this.$destroy)
    .subscribe((auth: AuthenticateService) =>  {
      console.log("Auth change support ", auth);
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
    this.authService.clear();
    this.router.navigateByUrl("/login");
  }

}
