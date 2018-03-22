import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserIcoComponent } from './user-ico.component';

describe('UserIcoComponent', () => {
  let component: UserIcoComponent;
  let fixture: ComponentFixture<UserIcoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserIcoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserIcoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
