import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerContainerComponent } from './spinner-container/spinner-container.component';
import { SpinnerService } from './spinner.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    SpinnerContainerComponent        
  ],
  exports: [
    SpinnerContainerComponent    
  ],
  providers: [SpinnerService]
})
export class SpinnerModule { }
