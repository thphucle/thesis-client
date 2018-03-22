import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { WindowRef } from 'app/shared-services/global.service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styles: [
    `
      iframe {
        width: 100%;
        display: block;
      }
    `
  ]
})
export class FaqComponent implements OnInit {
  @ViewChild('iframe') iframe: ElementRef;

  constructor(private windowRef: WindowRef) { }

  ngOnInit() {
    this.onResize({target: this.windowRef.nativeWindow});
  }

  @HostListener('window:resize', ['$event'])  
  onResize(event?:any) {    
    this.iframe.nativeElement.style.height = `${event.target.innerHeight - 70 - 15*2}px`;
  }

}
