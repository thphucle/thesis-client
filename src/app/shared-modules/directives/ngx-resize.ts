import { Directive, AfterContentChecked } from '@angular/core';
import { DatatableComponent } from "@swimlane/ngx-datatable";

@Directive({ selector: '[ngx-resize-watcher]' })
export class NgxResizeWatcherDirective implements AfterContentChecked {

    constructor(private table: DatatableComponent) { }

    private latestWidth: number;

    ngAfterContentChecked() {
        if (this.table && this.table.element.clientWidth !== this.latestWidth) {
            this.latestWidth = this.table.element.clientWidth;
            this.table.recalculate();
        }
    }

}