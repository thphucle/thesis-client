import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class LocalStorage {
  private storage;
  private obj:any = {};
  private bhChange = new BehaviorSubject(null);
  private sClearChange = new Subject();
  itemChange = this.bhChange.asObservable();
  clearChange = this.sClearChange.asObservable();

  constructor() {
    this.storage = localStorage;
  }

  getItem(key: string) {
    let val = this.obj[key];
    if (val) return val;    
    val = this.storage.getItem(key);

    if (!val) return;
    
    try {
      return JSON.parse(val);
    } catch (error) {
      throw Error('Parse value failed, it is not a object JSON format');
    }
  }

  setItem(key: string, val: any) {
    let input = JSON.stringify(val);
    this.storage.setItem(key, input);
    this.obj[key] = val;

    this.bhChange.next({key, value: val});
  }

  removeItem(key: string) {
    console.log("key remove", key);
    this.storage.removeItem(key);
    delete this.obj[key];
    this.bhChange.next({key, value: null});
  }

  clear() {
    this.obj = {};
    this.storage.clear();
    this.sClearChange.next(true);
  }
}

export enum SETTING_KEY {
  LANGUAGE = 'language',
  CURRENT_BRANCH = 'current_branch'
}

@Injectable()
export class SettingService {
  private SETTING_KEY = 'SETTING';
  private obj:any = {};
  private bhChange: BehaviorSubject<any>;
  change: Observable<any>;

  constructor(
    protected storage: LocalStorage
  ) {
    console.log("SettingService Init ", Date.now());
    this.obj = storage.getItem(this.SETTING_KEY) || {};
    this.bhChange = new BehaviorSubject(this.getSetting());
    this.change = this.bhChange.asObservable();
  }

  getSetting() {
    return this.obj;
  }

  set(key: SETTING_KEY, val: any) {
    this.obj[key] = val;
    this.storage.setItem(this.SETTING_KEY, this.obj);
    this.bhChange.next({key, value: val});
  }

  get(key: SETTING_KEY) {
    return this.obj[key];
  }

  clear() {
    this.obj = {};
    this.storage.removeItem(this.SETTING_KEY)
  }
}
