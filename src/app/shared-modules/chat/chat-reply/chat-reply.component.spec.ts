import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatReplyComponent } from './chat-reply.component';

describe('ChatReplyComponent', () => {
  let component: ChatReplyComponent;
  let fixture: ComponentFixture<ChatReplyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatReplyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatReplyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
