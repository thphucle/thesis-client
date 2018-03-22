import { Injectable, Inject, Renderer2 } from '@angular/core';
import { WindowRef } from "app/shared-services/global.service";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { DOCUMENT } from '@angular/platform-browser';

@Injectable()
export class GoogleMapService {

  private behaviorSubject = new BehaviorSubject(false);
  public onLoad = this.behaviorSubject.asObservable().share();
  
  constructor(
    private _window: WindowRef,
    renderer2: Renderer2,
    @Inject(DOCUMENT) private _document
  ) {         
    
    this._window.nativeWindow['googleMapCallback'] = () => {
      this.behaviorSubject.next(true);
    };

    if (_document.getElementById('googlemapscript')) return;    

    let s = renderer2.createElement('script');
    renderer2.setAttribute(s, 'id', 'googlemapscript')
    renderer2.setAttribute(s, 'type', 'text/javascript');
    renderer2.setAttribute(s, 'src', "https://maps.googleapis.com/maps/api/js?key=AIzaSyCGnAJvqI-ES39b7dM_ATeZuu4Kwe9RFeU&libraries=places&callback=googleMapCallback");
    renderer2.setAttribute(s, 'async', 'true');
    renderer2.setAttribute(s, 'defer', 'true');
    renderer2.appendChild(_document.body, s);
  }

}
