import { Component, Inject, EventEmitter, Input, Output, Renderer2, ViewChild, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Observable } from 'rxjs/Observable';


@Component({
  selector: 'app-modal',
  template: `
  <div (click)="onContainerClicked($event)" class="modal fade" tabindex="-1" [ngClass]="{'show': visibleAnimate}"
       [ngStyle]="{'display': visible ? 'block' : 'none', 'opacity': visibleAnimate ? 1 : 0}">
    <div [class]="'modal-dialog ' + classSize">
      <div class="modal-content">
        <div class="modal-header">
          <ng-content select="[app-modal-header]"></ng-content>
          <button (click)="closeBtnClick()" type="button" class="close" data-dismiss="modal">×</button>
        </div>
        <div class="modal-body">
          <ng-content select="[app-modal-body]"></ng-content>
        </div>
        <div [class.hidden]="!footer.children.length" #footer class="modal-footer">
          <ng-content select="[app-modal-footer]"></ng-content>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: []
})
export class ModalComponent implements OnDestroy {

  @Input() set visible(isVisible: boolean) {
    if (isVisible) {
      this.show();
    } else {
      this.hide();
    }
  }

  get visible() { return this._visible; }

  @Output() visibleChange = new EventEmitter<any>();
  @Input() classSize = '';
  @ViewChild('footer') footer: HTMLElement;

  public visibleAnimate = false;
  private _visible = false;
  private backdrop: any;

  constructor( @Inject(DOCUMENT) protected document: any, protected renderer: Renderer2) {
  }

  ngOnDestroy() {
    this.hide();
  }

  protected show(): Promise<any> {
    console.log("Class ", this.classSize);
    this.backdrop = this.renderer.createElement('div');
    this.renderer.addClass(this.backdrop, 'modal-backdrop');
    this.renderer.addClass(this.backdrop, 'fade');
    this.renderer.addClass(this.document.body, 'modal-open');

    this.renderer.appendChild(this.document.body, this.backdrop);
    this._visible = true;
    return new Promise((resolve, _) => setTimeout(() => {
      this.renderer.addClass(this.backdrop, 'show');
      setTimeout(() => {
        this.visibleAnimate = true
        resolve();
      }, 100);
    }, 100));
  }

  protected hide(): Promise<any> {
    if (!this.visibleAnimate) return;

    if (!this.backdrop) return;
    this.renderer.removeClass(this.document.body, 'modal-open');
    this.renderer.removeClass(this.backdrop, 'show');
    this.visibleAnimate = false;
    
    return new Promise((resolve, _) => setTimeout(() => {
      this.renderer.removeChild(this.document.body, this.backdrop);
      setTimeout(() => {
        this._visible = false;
        resolve();
      }, 100);
      
    }, 300));
  }

  public closeBtnClick() {
    this.hide().then(() => {
      this.visibleChange.emit(this.visible);
    });
  }

  public onContainerClicked(event: MouseEvent): void {
    event.stopPropagation();
    if ((<HTMLElement>event.target).classList.contains('modal')) {
      let promise = this.hide();
      if (!promise) return;
      promise.then(() => {
        this.visibleChange.emit(this.visible);
      });
    }
  }

}
