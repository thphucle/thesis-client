import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatInputSummernoteComponent } from './chat-input-summernote.component';

describe('ChatInputSummernoteComponent', () => {
  let component: ChatInputSummernoteComponent;
  let fixture: ComponentFixture<ChatInputSummernoteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatInputSummernoteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatInputSummernoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
