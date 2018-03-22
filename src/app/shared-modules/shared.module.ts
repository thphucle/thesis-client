import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from "@angular/forms";
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { DialogComponent } from './dialog/dialog.component'
import { UserInfoComponent } from './user-info/user-info.component';
import { ChatComponent } from './chat/chat.component';
import { ChatReplyComponent } from './chat/chat-reply/chat-reply.component';
import { ChatToolbarComponent } from './chat/chat-toolbar/chat-toolbar.component';
import { ChatInputComponent } from './chat/chat-input/chat-input.component'
import { RouterModule } from "@angular/router";
import { ChatInputSummernoteComponent } from './chat/chat-input-summernote/chat-input-summernote.component';
import { LoadingDirective } from "app/shared-modules/directives/loading/loading.directive";
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { InputTypingDirective } from './directives/input-typing.directive';
import { AutocompleteComponent } from './autocomplete/autocomplete.component';
import { MainPipe } from 'app/shared-pipes';
import { SpinnerModule } from 'app/shared-modules/spinner-module/spinner.module';
import { SpinnerContainerComponent } from 'app/shared-modules/spinner-module/spinner-container/spinner-container.component';
import { FilterComponent } from './filter/filter.component';
import { CircleSvgComponent } from './circle-svg/circle-svg.component';
import { ModalComponent } from './modal/modal.component';
import { FileuploadComponent } from 'app/shared-modules/fileupload/fileupload.component';
import { DndDirective } from 'app/shared-modules/directives/dragndrop.directive';
import { NgxResizeWatcherDirective } from './directives/ngx-resize';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MainPipe,
    SpinnerModule,
    NgxDatatableModule
  ],
  declarations: [
    DialogComponent,
    UserInfoComponent,
    ChatComponent,
    ChatReplyComponent,
    ChatToolbarComponent,
    ChatInputComponent,
    ChatInputSummernoteComponent,
    LoadingDirective,
    DndDirective,
    ConfirmDialogComponent,
    InputTypingDirective,
    NgxResizeWatcherDirective,
    AutocompleteComponent,
    FilterComponent,
    CircleSvgComponent,
    ModalComponent,
    FileuploadComponent
  ],
  exports: [
    ChatComponent,
    DialogComponent,
    ModalComponent,
    UserInfoComponent,
    ConfirmDialogComponent,
    LoadingDirective,
    DndDirective,
    InputTypingDirective,
    NgxResizeWatcherDirective,
    AutocompleteComponent,
    SpinnerContainerComponent,
    FilterComponent,
    FileuploadComponent,
    CircleSvgComponent,
    RouterModule,
    MainPipe,
    SpinnerModule,
    NgxDatatableModule
  ],
  providers: []
})
export class SharedModule { }
