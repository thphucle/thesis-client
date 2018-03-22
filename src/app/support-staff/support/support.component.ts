import { Component, OnInit, HostListener, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { WindowRef } from "app/shared-services/global.service";
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styles: [
    `
      :host .card {
        height: 100%; 
        margin-bottom: 0;
      }
      :host .card .card-body{
        height: calc(100% - 44px);        
      }
      :host >>> .ticket-list {
        height: 100%;
      }

      :host >>> .ticket-list > div,
      :host >>> .ticket-list .row > div,
      :host >>> .ticket-list .card {
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
export class SupportComponent implements OnInit, OnDestroy {
  ngOnDestroy(): void {
    console.log("Support destroy")
  }
  @ViewChild('supportContainer') container: ElementRef;

  constructor(
    private windowRef: WindowRef,
    protected router: Router,
    protected activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {    
    this.onResize({target: this.windowRef.nativeWindow});
  }

  @HostListener('window:resize', ['$event'])  
  onResize(event?:any) {
    this.container.nativeElement.style.height = `${event.target.innerHeight - 120 - 30*2}px`;
  }

}
