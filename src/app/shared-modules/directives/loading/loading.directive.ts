import { Directive, ViewContainerRef, ElementRef, Renderer2, Input, TemplateRef, ComponentFactoryResolver } from '@angular/core';

@Directive({
  selector: '[appLoading]'
})
export class LoadingDirective {

  constructor(
    private element: ElementRef,
    private renderer: Renderer2
  ) {
    this._nativeElement = element.nativeElement;
  }

  private _nativeElement:any;
  private _isLoading = false;

  @Input('appLoading') set isLoading(value: boolean | Promise<any>) {
    if (value === undefined) return;

    this.enable();
    let promise = typeof value === "boolean" ? Promise.resolve(value) : value;
    promise.then((isLoading) => {      
      this._isLoading = typeof isLoading === "boolean" ? isLoading : false;
      if (this._isLoading) {
        this.enable();
      } else {
        this.disable();
      }
    }).catch(e => {
      this.disable();
    });
  }
  

  private enable() {    
    this.renderer.setAttribute(this._nativeElement, 'disabled', 'disabed');
    this._nativeElement.disabled = true;
    [1,2,3].forEach(() => {
      let span = this.renderer.createElement('span');            
      this.renderer.addClass(span, 'saving');
      this.renderer.setProperty(span, 'textContent', '.');
      // span.textContent = '.';
      this.renderer.appendChild(this._nativeElement, span);      
    });
  }

  private disable() {    
    try {
      this.renderer.removeAttribute(this._nativeElement, 'disabled');    
      let savingElements = this._nativeElement.querySelectorAll('.saving');
      if (!savingElements) return;
      savingElements.forEach(span => 
        this.renderer.removeChild(this._nativeElement, span)
      );
      
    } catch (error) {
      alert(error.message);
    }
  }

}
