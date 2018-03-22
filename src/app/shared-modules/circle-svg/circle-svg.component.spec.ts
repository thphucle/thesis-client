import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CircleSvgComponent } from './circle-svg.component';

describe('CircleSvgComponent', () => {
  let component: CircleSvgComponent;
  let fixture: ComponentFixture<CircleSvgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CircleSvgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CircleSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
