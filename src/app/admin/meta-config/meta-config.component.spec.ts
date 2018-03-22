import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetaConfigComponent } from './meta-config.component';

describe('MetaConfigComponent', () => {
  let component: MetaConfigComponent;
  let fixture: ComponentFixture<MetaConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MetaConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetaConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
