import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { SpinnerService } from '../spinner.service';

@Component({
  selector: 'app-spinner-container',
  styleUrls: ['./spinner-container.component.scss'],
  template: `
  <div class="spinner-container">
    <div *ngIf="show" class="spinner-backdrop">
      <div class="spinner-wrap">
        <div class="spinner-box">
          <img src="/assets/images/spinner.gif" alt="loading">
        </div>
        <p *ngIf="!!message">{{message}}</p>
      </div>      
    </div>
    <ng-content></ng-content>
  </div>
  `
})
export class SpinnerContainerComponent implements OnInit, OnDestroy {
  
  private _name: string;
  private _group: string;
  private isShow = false;
  private _delay = 400;
  private timeoutId:any;
  @Input() message: string = 'Loading';

  @Input() set delay(val) {
    this._delay = val;    
  }

  get delay() {
    return this._delay;
  }

  @Input() set show(val: boolean) {      
    clearTimeout(this.timeoutId);
    if (val) {
      
      this.timeoutId = setTimeout(() => {
        this.isShow = val;
        this.showChange.emit(val);
      }, this._delay);
    } else {
      this.isShow = val;
      this.showChange.emit(val);
    }
  }

  get show() {
    return this.isShow;
  }

  @Output() showChange = new EventEmitter<boolean>();
  
  @Input() set name (val: string) {
    // this.spinnerService._changeSpinnerName(this._name, val, this);
    this._name = val;
  }

  get name () {
    return this._name;
  }

  @Input() set group (val: string) {
    // this.spinnerService._changeSpinnerGroup(this._group, val, this);
    this._group = val;
  }

  get group() {
    return this._group;
  }

  constructor(
    private spinnerService: SpinnerService
  ) { }

  ngOnInit() {
    
    this.spinnerService._register(this);
  }

  ngOnDestroy(): void {
    this.spinnerService._unregister(this);
  }
}
