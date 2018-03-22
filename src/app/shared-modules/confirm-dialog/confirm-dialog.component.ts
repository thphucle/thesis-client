import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styles: [
    `
      :host >>> app-dialog .dialog {
        width: 400px;
        padding: 20px 10px;
      }
    `,
    `
      .confirm-dialog h4 {
        margin-bottom: 20px;
      }

      .btn:not(:first-child) {
        margin-left: 5px;
      }

      .message {
        margin-bottom: 20px;
        text-align: justify;
      }
    `,
    `
      @media (max-width: 425px) {
        :host >>> app-dialog .dialog {
          width: 95%;
          padding: 10px;
        }
      }
    `
  ]
})
export class ConfirmDialogComponent implements OnInit {
  @Output('events') events: EventEmitter<any> = new EventEmitter();  
  @Input('closeOnConfirm') isCloseOnConfirm = true;
  
  _showDialog:boolean = false;
  @Input() set showDialog(value) {    
    this._showDialog = value;
    this.showDialogChange.emit(value);
  }
  
  get showDialog() {
    return this._showDialog;
  }

  @Output() showDialogChange: EventEmitter<boolean> = new EventEmitter();

  @Input() cancelText:string = 'CANCEL';
  @Input() confirmText:string = ' YES ';

  constructor() { }

  ngOnInit() {
  }

  cancel() {
    this.setShowDialog(false);    
    this.events.emit('oncancel');
  }

  confirm() {
    this.events.emit('onconfirm');
    if (this.isCloseOnConfirm) {
      this.setShowDialog(false);
    }
  }

  private setShowDialog(value: boolean) {
    this.showDialog = value;
    this.showDialogChange.emit(value);
  }

}
