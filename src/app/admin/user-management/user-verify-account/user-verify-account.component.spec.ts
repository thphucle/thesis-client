import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserVerifyAccountComponent } from './user-verify-account.component';

describe('UserVerifyAccountComponent', () => {
  let component: UserVerifyAccountComponent;
  let fixture: ComponentFixture<UserVerifyAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserVerifyAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserVerifyAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
