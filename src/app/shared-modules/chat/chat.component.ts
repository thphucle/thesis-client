import { ElementRef, Renderer2, Component, OnInit, Input, Output, EventEmitter, ViewChild, IterableDiffers, IterableDiffer, OnChanges, AfterViewChecked, AfterViewInit, AfterContentInit, AfterContentChecked } from '@angular/core';
import { AuthenticateService } from 'app/shared-services/authenticate.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewChecked {

  @ViewChild('chatMessages') chatMessages: ElementRef;
  @ViewChild('container') container: ElementRef;
  @Input() isWidget:boolean = false;
  @Input() ticket:any;
  @Input() set replies (val) {
    this._replies = val;
    this.scrollToBottom();
  }

  get replies () {
    return this._replies;
  }
  @Input('toolbarButtons') buttons;
  @Input('editor') editorType = 'default';
  private _replies = [];

  message:string = '';
  private disableScrollDown = false;

  @Output() onSubmit: EventEmitter<string> = new EventEmitter();
  @Output() changeStatusEvent: EventEmitter<string> = new EventEmitter();
  @Output('uploadImage') onUploadImage: EventEmitter<File> = new EventEmitter();
  
  constructor() {}

  ngOnInit() {
    if (this.buttons) {
      this.buttons.forEach(buttonConfig => {
        if (!buttonConfig.text) return console.error('Missing text');
        buttonConfig.className = buttonConfig.className || 'btn-primary';
      });
    }       
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }  

  scrollToBottom(): void {
    if (this.disableScrollDown) return;

    try {      
      this.container.nativeElement.scrollTop = this.container.nativeElement.scrollHeight;
    } catch(err) { }
  }

  onCollapse() {
    console.log("onCollapse")
  }
  onClose() {
    console.log("onClose")
  }

  onScroll() {
    
    let element = this.container.nativeElement
    let atBottom = element.scrollHeight - element.scrollTop === element.clientHeight    
    
    if (this.disableScrollDown && atBottom) {
        this.disableScrollDown = false
    } else {
        this.disableScrollDown = true
    }
  }

  onMessageChange(message) {
    this.message = message;
  }

  onSubmitChat() {    
    this.onSubmit.emit(this.message);
    this.disableScrollDown = false;    
  }

  changeStatus ($event) {
    let value = $event.target.value;
    this.changeStatusEvent.emit(value);
  }
}
