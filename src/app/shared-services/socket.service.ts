import { Injectable } from '@angular/core';
import { AuthenticateService } from "app/shared-services/authenticate.service";
import { environment } from "../../environments/environment";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
import * as io from 'socket.io-client';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

const CONFIG: any = environment || {
  server: ""
};

const endPoint: string = 'exchange';

@Injectable()
export class SocketService {
  private authenticate = new Subject();
  private isAuthenticated = false;
  private ready = new BehaviorSubject(false);  

  subscribersCounter = 0;
  ioSocket: any;

  constructor() {
    
  }

  initSocket(token: string) {
    if (this.ioSocket && this.ioSocket.connected) {
      return;
    }

    const options = {
      query: `token=${token}`
    }
    const url = `${CONFIG.serverSocket}/${endPoint}`;
    this.ioSocket = io(url, options);
    this.ready.next(true);
    
    this
    .on('connect', () => {
      console.log("socket connect success");
      this.emit('LOGIN', {}, resp => {
      
        if (resp.error) {
          return this.authenticate.error(resp.error);
        }
        this.isAuthenticated = true;
        this.authenticate.next(resp.data);
      });
    });

    this.on('disconnect', () => {
      console.log("Socket Disconnected");
    });
  }

  on(eventName: string, callback: Function) {
    this.ioSocket.on(eventName, callback);
  }

  once(eventName: string, callback: Function) {
    this.ioSocket.once(eventName, callback);
  }

  connect() {
    return this.ioSocket.connect();
  }

  disconnect(close?: any) {
    return this.ioSocket && this.ioSocket.disconnect.apply(this.ioSocket, arguments);
  }

  emit(eventName: string, data?: any, callback?: Function) {
    return this.ioSocket.emit.apply(this.ioSocket, arguments);
  }

  removeListener(eventName: string, callback?: Function) {
    return this.ioSocket.removeListener.apply(this.ioSocket, arguments);
  }

  removeAllListeners(eventName?: string) {
    return this.ioSocket.removeAllListeners.apply(this.ioSocket, arguments);
  }

  /** create an Observable from an event */
  fromEvent<T>(eventName: string): Observable<T> {
    this.subscribersCounter++;    
    return Observable.create((observer: any) => {
      this.onReady().subscribe((val) => {
        if (!val) return;
        this.ioSocket.on(eventName, (data: T) => {          
          observer.next(data);
        });
      });
      
      return () => {
        if (this.subscribersCounter === 1)
          this.ioSocket.removeListener(eventName);
      };
    }).share();
  }

  /* Creates a Promise for a one-time event */
  fromEventOnce<T>(eventName: string): Promise<T> {
    return new Promise<T>(resolve => this.once(eventName, resolve));
  }

  onAuthenticate() {
    return this.authenticate.asObservable().share();
  }

  onReady() {
    return this.ready.asObservable().share();
  }

}
