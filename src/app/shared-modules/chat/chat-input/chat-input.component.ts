import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-chat-input',
  templateUrl: './chat-input.component.html',
  styleUrls: ['./chat-input.component.scss']
})
export class ChatInputComponent implements OnInit {
  @Output() onMessageChange: EventEmitter<any> = new EventEmitter();
  @Output() onSubmit: EventEmitter<any> = new EventEmitter();
  message:string = '';

  constructor() { }

  ngOnInit() {
  }

  messageChange($event) {
    
  }

  submit(event) {
    
    event.preventDefault();
    this.onSubmit.emit('');
    this.message = '';
  }

}
