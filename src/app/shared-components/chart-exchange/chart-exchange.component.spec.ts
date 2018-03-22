import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartExchangeComponent } from './chart-exchange.component';

describe('ChartExchangeComponent', () => {
  let component: ChartExchangeComponent;
  let fixture: ComponentFixture<ChartExchangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartExchangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartExchangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
