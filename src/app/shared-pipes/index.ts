import { NgModule } from '@angular/core';
import {CommonModule} from "@angular/common";

import {TextStripHtmlPipe, TruncatePipe, PadZeroPipe, PadKPipe} from "./text-transform.pipe";

@NgModule({
  declarations:[
    TextStripHtmlPipe,
    TruncatePipe,
    PadZeroPipe,
    PadKPipe
  ],
  imports:[CommonModule],
  exports:[TextStripHtmlPipe, TruncatePipe, PadZeroPipe, PadKPipe]
})

export class MainPipe{}