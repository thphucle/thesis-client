import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-chat-reply',
  templateUrl: './chat-reply.component.html',
  styleUrls: ['./chat-reply.component.scss']
})
export class ChatReplyComponent implements OnInit {
  @Input() reply:any = {};
  
  constructor() { }

  ngOnInit() {
  }

}
