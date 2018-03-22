import { Injectable, Inject, Renderer2 } from '@angular/core';
import { WindowRef } from "app/shared-services/global.service";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { DOCUMENT } from '@angular/platform-browser';

@Injectable()
export class GoogleTranslateService {
  private isLoaded = false;
  private behaviorSubject = new BehaviorSubject(false);
  public onLoad = this.behaviorSubject.asObservable();
  
  constructor(
    private _window: WindowRef,
    renderer2: Renderer2,
    @Inject(DOCUMENT) private _document
  ) {         
    
    this._window.nativeWindow['googleTranslateElementInit'] = () => {
      console.log("Gg translate loaded");
      this.isLoaded = true;
      this.behaviorSubject.next(true);
    };

    if (this.isLoaded == true) {
      this.behaviorSubject.next(true);
      return;
    }
    console.log("REnder 2222 ", renderer2);
    let s = renderer2.createElement('script');
    renderer2.setAttribute(s, 'id', 'googletranslatescript')
    renderer2.setAttribute(s, 'type', 'text/javascript');
    renderer2.setAttribute(s, 'src', "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit");
    renderer2.setAttribute(s, 'async', 'true');
    renderer2.setAttribute(s, 'defer', 'true');
    renderer2.appendChild(_document.body, s);
  }

}
