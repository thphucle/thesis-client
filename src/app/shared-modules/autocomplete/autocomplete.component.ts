import { Component, OnInit, Input, forwardRef, EventEmitter, Output, HostListener } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

export interface AutocompleteSetting {
  textField:string;
  valueField:string;
}

@Component({
  selector: 'app-autocomplete',  
  template: `
    <div class="autocomplete">
      <input appInputTyping
      autocomplete="off"
      (focus)="showPane()"
      (blur)="shouldHidePane()"
      class="form-control"
      type="text" 
      name="search_field"
      [(ngModel)]="textSearch"
      (inputChange)="doFilter(textSearch)">
      <div (mouseenter)="mouseEnter()" (mouseleave)="mouseLeave()" [ngClass]="{show: !isHide}" class="dropdown">
        <div *ngIf="filteredItems && filteredItems.length" class="dropdown-menu">
          <li [ngClass]="{active: item._autocomplete_focus}" *ngFor="let item of filteredItems; let i=index">
            <a class="dropdown-item" (click)="choose(i)">{{item[setting.textField]}}</a>
          </li>        
        </div>
        <div *ngIf="filteredItems == undefined" class="dropdown-menu">
          <li class="text-center">
            <span>Loading...</span>
          </li>
        </div>
        <div *ngIf="filteredItems && filteredItems.length == 0" class="dropdown-menu">
          <li class="text-center">
            <span>Not available</span>
          </li>
        </div>
      </div>      
    </div>
  `,
  styles: [
    `
      .autocomplete {
        position: relative;
      }
      .autocomplete .dropdown-menu {
        display: block;
        width: 100%;
        max-height: 400px;
        overflow-y: auto;
      }
    `
  ]
})
export class AutocompleteComponent implements OnInit {
  private _source: any[] = [];    
  private _items:any[] = [];
  private _selectedItem;

  private _currentFocusIndex = Infinity;
  private _isMouseEnter = false;

  public filteredItems: any[];
  public isHide = true;  

  public textSearch:string = '';
  @Input() setting: AutocompleteSetting;
  
  @Input() set items(value: any[]) {
    if (!value) return;
    this._source = value;
    this._items = this._source.map(v => Object.assign({'_autocomplete_focus': false}, v));
    this.init();
  }

  @Output() onSelect = new EventEmitter<any>();
  @Input() set selectedItem (value:any) {
    if (!value) return;
    console.log("Set selectedItem", value);
    this._selectedItem = value;
    this.textSearch = this._selectedItem[this.setting.textField];
    this.doFilter(this.textSearch);
  }

  @Output() selectedItemChange = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
    if (!this.setting) throw Error('Autocomplete: missing setting');
  }

  private getItemValue(item): string {
    return item[this.setting.valueField];
  }

  private getItemText(item): string {
    return item[this.setting.textField];
  }

  @HostListener('keydown', ['$event'])
  keyDown(event) {
    
    let key = event.keyCode;
    let index = this._currentFocusIndex, length = this.filteredItems.length;
    const keys = [13, 38, 40];
    if (keys.indexOf(key) == -1) return;
    // enter
    if (key == 13 && index > -1) {         
      this.choose(this._currentFocusIndex);      
      return;
    }
    //down
    if (key == 40) {
      index = index == Infinity ? -1 : this._currentFocusIndex;
      index++;
    }
    // up
    if (key == 38) {
      index = index == Infinity ? 0 : this._currentFocusIndex;
      index--;
    }

    this.selectItemIndex((index + length) % length);    
  }

  mouseEnter() {
    this._isMouseEnter = true;
  }

  mouseLeave() {
    this._isMouseEnter = false;
  }

  private selectItemIndex(index:number) {
    let oldItem = this.filteredItems[this._currentFocusIndex];
    if (oldItem) {
      oldItem['_autocomplete_focus'] = false;
    }

    this._currentFocusIndex = index;

    let item = this.filteredItems[index];
    item['_autocomplete_focus'] = true;    
  }

  init() {
    let items = this._items;
    this.filter(this.textSearch || '', items);
  }

  hidePane() {
    this.isHide = true;
  }

  shouldHidePane() {
    if (this._isMouseEnter) return;
    this.hidePane();
  }

  showPane() {
    this.isHide = false;
  }
  
  resetFocus() {
    if (this._currentFocusIndex === Infinity) {
      return;
    }

    let item = this.filteredItems[this._currentFocusIndex];
    if (!item) return;
    item['_autocomplete_focus'] = false;
    this._currentFocusIndex = Infinity;
  }

  choose(index) {    
    let item = this.filteredItems[index];    
    this.textSearch = this.getItemValue(item);    
    this.onSelect.emit(this.filteredItems[index]);
    this.hidePane();
  }

  doFilter(text) {
    this.filter(text, this._items);
  }

  protected filter(text: string, list: any[]) {
    this.resetFocus();
    if (!text) {
      return this.filteredItems = this._items;
    }

    let textLower = text.toLowerCase();
    this.filteredItems = list.filter(
      item => this.getItemValue(item).toLowerCase().indexOf(textLower) > -1
    );

    if (this.filteredItems.length) {
      this.showPane();
    }    
  }
}
