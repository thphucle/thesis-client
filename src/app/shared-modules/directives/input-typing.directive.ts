import { Directive, Input, EventEmitter, Output, ElementRef, HostListener, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appInputTyping]'
})
export class InputTypingDirective implements OnDestroy {
  private timeoutId;

  @Input() delay: number = 500; // 500 ms
  @Output() inputChange: EventEmitter<string> = new EventEmitter();

  constructor(private element: ElementRef) { }
  ngOnDestroy() {
    clearTimeout(this.timeoutId);
  }
  
  @HostListener('input') onInput() {
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this.inputChange.emit(this.element.nativeElement.value);
    }, this.delay);
  }
}
