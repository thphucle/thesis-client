import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTokenComponent } from './user-token.component';

describe('UserTokenComponent', () => {
  let component: UserTokenComponent;
  let fixture: ComponentFixture<UserTokenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserTokenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
