import { Component, OnInit, Input, Output, OnChanges, EventEmitter, ViewEncapsulation } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],  
  animations: [
    trigger('dialog', [
      transition('void => *', [
        style({ transform: 'scale3d(.3, .3, .3)', opacity: '1' }),
        animate('300ms cubic-bezier(0.175, 0.885, 0.32, 1.275)')
      ]),
      transition('* => void', [
        animate('200ms ease-out', style({ opacity: '0' })),
        style({transform: 'scale3d(.0, .0, .0)',})
      ])
    ])
  ]
})


export class DialogComponent implements OnInit {
  @Input() closable = true;
  @Input() size = '';
  @Input() visible: boolean;
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() { }

  close() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }
}