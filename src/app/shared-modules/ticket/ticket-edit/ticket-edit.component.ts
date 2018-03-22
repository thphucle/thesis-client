import { Component, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { TicketService, TicketReplyService } from "app/shared-services/api/ticket.service";
import { ActivatedRoute } from "@angular/router";
import { AuthenticateService } from "app/shared-services/authenticate.service";
import { ImageService } from "app/shared-services/api/image.service";
import { SocketService } from 'app/shared-services/socket.service';
import { Subject } from 'rxjs/Subject';
import { GlobalService } from 'app/shared-services/global.service';

@Component({
  selector: 'app-ticket-edit',
  templateUrl: './ticket-edit.component.html',
  styles: [
    `
      :host /deep/ .ticket-detail {
        padding: 10px;        
        border-bottom: 1px solid #e9ecef;
      }      
    `,
    `
      :host >>> .box {
        display: flex;
        flex-direction: column;
        max-height: 100vh;
        height: 100%;
        margin-bottom: 0;
      }

      :host >>> .box .box-body {        
        flex-grow: 1;
        margin-top: 0;
        padding-top: 0;
      }

      :host >>> .direct-chat-messages {
        min-height: auto;
        max-height: auto;
      }

      :host >>> .note-editor.note-frame.card {
        margin-bottom: 0;
      }
    `
  ]
})
export class TicketEditComponent implements OnInit, OnDestroy {
  ticketId:number;
  ticket:any = {};  

  user:any;
  subscribes = [];
  closeTicketEmitter = new EventEmitter<any>();
  buttonsConfig;
  editorType = 'default';

  $destroy = new Subject();

  constructor(
    private ticketService: TicketService,
    private replyService: TicketReplyService,
    private imageService: ImageService,    
    activatedRoute: ActivatedRoute,
    protected auth: AuthenticateService,
    private shared: GlobalService
  ) {
    activatedRoute
    .params
    .takeUntil(this.$destroy)
    .subscribe(async params => {
      this.ticketId = Number(params['id']);
      if (this.ticketId) {
        this.ticket = await this.loadTicket(this.ticketId);
        shared.currentTicket = this.ticketId;
      }
    });

    if (['admin', 'support'].indexOf(auth.account.role) > -1) {
      this.editorType = 'summernote';
      this.buttonsConfig = [
        {text: 'CLOSE TICKET', emitter: this.closeTicketEmitter}
      ];
  
      this.closeTicketEmitter.subscribe(async () => {
        
        let status = 'closed';
        let uTicket = await this.ticketService.update(this.ticketId, {
          status
        });
        this.ticket.status = status;
      });

    }

    this.user = auth.account;
  }

  ngOnInit() {
    this.replyService
    .fromEvent('TICKET_REPLY_CREATED')
    .takeUntil(this.$destroy)
    .subscribe( (reply:any) => {      
      if (reply.ticket_id != this.ticketId) return;
      let replyy = this.normalizeReply(reply);
      this.ticket.replies.push(replyy);
      this.ticketService.changeStatus(this.ticketId, reply.Ticket.status);    
    });
  }

  ngOnDestroy() {
    this.shared.currentTicket = -1;
    this.$destroy.next(false);
    this.$destroy.unsubscribe();
  }

  async loadTicket(id:number) {
    
    let ticketResp = await this.ticketService.get(id);
    if (ticketResp.error) {
      return toastr.error(ticketResp.error.message, 'Load tickets failed');
    }

    let ticket = ticketResp.data;
    let repliesResp = await this.replyService.list({ticket_id: id});
    if (repliesResp.error) {
      return toastr.error(repliesResp.error.message, 'Load ticket failed');
    }
    repliesResp.data.forEach(r => this.normalizeReply(r));

    ticket.replies = repliesResp.data;
    
    return ticket;
  }

  private normalizeReply(reply) {
    reply.user = reply.User;    
    reply.user.avatar = (reply.user.avatar && reply.user.avatar.thumbnail) || '/assets/images/ava.png';
    reply.user.name = reply.user.fullname || reply.user.username;
    reply.who = 'other';
    
    return reply;
  }  

  private getLastTicketReply() {
    let replies = this.ticket.replies;
    if (replies && replies.length) {
      return replies[replies.length - 1];
    }
  }

  async reply(message: string) {
    let reply = {
      ticket_id: this.ticketId,
      message
    };
    let replyResp = await this.replyService.create(reply);
    if (replyResp.error) {
      return toastr.error(replyResp.error.message, 'Cannot submit reply now');
    }    

    // this.ticket.replies.push(this.normalizeReply(replyResp.data));
    // console.log("PUSH ", replyResp.data.id);
  }

  async changeStatus (status) {
    console.log("changeStatus :: ", status);

    if (status != this.ticket.status) {
      let uTicket = await this.ticketService.update(this.ticketId, {
        status
      });
      this.ticket.status = status;
    }
  }

  async uploadImage({files, editor}) {
    let imageResp = await this.imageService.create(files[0]);
    if (imageResp.error) {
      return toastr.error(imageResp.error.message, 'Upload image failed');
    }
    
    let image = imageResp.data[0];    
    $(editor).summernote('insertImage', image.medium);
  }  

}
