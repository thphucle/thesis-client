import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { TicketService, TicketReplyService } from "app/shared-services/api/ticket.service";
import { WindowRef } from "app/shared-services/global.service";

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styles: [
    `
      :host >>> .ticket-list {
        height: 100%;
      }

      :host >>> .ticket-list > div,
      :host >>> .ticket-list .row > div,
      :host >>> .ticket-list .box {
        height: 100%;        
      }
    `,

    `
    @media(max-width: 768px) {
      :host >>> .ticket-list {
        height: auto;
      }
    }
    `
  ]
})
export class SupportComponent implements OnInit {
  @ViewChild('supportContainer') container: ElementRef;
  
  constructor(
    private windowRef: WindowRef
  ) { }

  ngOnInit() {
    this.onResize({target: this.windowRef.nativeWindow});
  }
  
  @HostListener('window:resize', ['$event'])  
  onResize(event?:any) {    
    this.container.nativeElement.style.height = `${event.target.innerHeight - 120 - 30*2}px`;
  }

}
