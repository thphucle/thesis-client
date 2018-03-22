import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';

interface FilterTag {
  from: Date
  to: Date
  id: number
}

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
  _filters: FilterTag[] = [];
  _currentActive: FilterTag;
  fromDate;
  toDate;
  message = '';
  
  constructor() { }

  @Input() clearOnApply = false;

  @Input()
  set filters(val: FilterTag[]) {
    this._filters = val;
  }

  get filters() {
    return this._filters;
  }

  @Input()
  set currentActive(tag: FilterTag) {
    this._currentActive = tag;
  }

  get currentActive() {
    return this._currentActive;
  }

  @Input('from') set from (val: Date) {
    if (!val) { return };
    this.fromDate = val;
  }

  @Input() set to (val: Date) {
    if (!val) { return };
    this.toDate = val;
  }

  @Output('onReset')
  dateChange = new EventEmitter<any>();

  @Output('currentActiveChange')
  activeFilter = new EventEmitter<FilterTag>();
  @Output('filtersChange')
  filtersChange = new EventEmitter<FilterTag[]>();

  ngOnInit() {
  }

  addFilterTag() {
    let from = this.fromDate;
    let to = this.toDate;
    if (!from && !to) return;
    if (from > to) {
      console.log("From", from, to);
      this.message = 'From date must be less than to date';
      return;
    }

    this.message = '';

    let newTag = {
      from,
      to,
      id: Date.now()
    };
    this.currentActive = newTag;
    this.filters.push(newTag);
    this.filtersChange.emit(this.filters);
    this.activeFilter.emit(this.currentActive);
    if (this.clearOnApply) {
      this.fromDate = this.toDate = undefined;
    }
  }

  removeFilterTag(tag: FilterTag) {
    this.fromDate = this.toDate = undefined;
    let index = this.filters.findIndex(t => t.id == tag.id);
    this.filters.splice(index, 1);
    this.filtersChange.emit(this.filters);
    if (this.filters.length) {
      this.currentActive = this.filters[this.filters.length - 1];
    } else {
      this.currentActive = null;
    }

    this.activeFilter.emit(this.currentActive);        
  }

  removeAll() {
    this._filters = [];
    this.filtersChange.emit(this.filters);
  }

  activeFilterTag(tag: FilterTag) {
    this._currentActive = tag;
    this.activeFilter.emit(tag);    
  }

  onDateChange(date, fromto) {
    let data = {
      from: this.fromDate,
      to: this.toDate
    };
    if (fromto == 'from') {
      data.from = date;      
    }

    if (fromto == 'to') {
      data.to = date;
    }

    if (!data.from && !data.to) {
      this.dateChange.emit();
    }

  }

}
