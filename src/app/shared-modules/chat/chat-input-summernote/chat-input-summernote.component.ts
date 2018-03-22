import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Subject } from "rxjs/Subject";

@Component({
  selector: 'app-chat-input-summernote',
  template: `
    <form (ngSubmit)="submit()" novalidate>
      <div id="editor"></div>
    </form>
  `  
})
export class ChatInputSummernoteComponent implements OnInit {
  @Output() onMessageChange: EventEmitter<any> = new EventEmitter();
  @Output() onSubmit: EventEmitter<any> = new EventEmitter();
  @Output('uploadImage') onUploadImage: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
    let self = this;
    var SendButton = function (context) {
      var ui = $.summernote.ui;
    
      // create button
      var button = ui.button({
        contents: '<i class="fa fa-paper-plane"/> SEND',
        tooltip: 'send',
        click: () => {
          // invoke insertText method with 'hello' on editor module.
          self.submit();
        }
      });
    
      return button.render();   // return button as jquery object
    }

    let editor = $('#editor').summernote({
      minHeight: 50,
      maxHeight: 200,
      callbacks: {
        onImageUpload: (files) => {
          this.onUploadImage.emit({files, editor});
        },
        onChange: (contents, $editable) => {
          this.onMessageChange.emit(contents);
        }
      },
      toolbar: [
        // [groupName, [list of button]]
        ['style', []],
        ['font', []],
        ['fontsize', ['fontsize']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['height', []],
        ['insert', ['link', 'picture', 'video']],
        ['mybutton', ['send']]
        
      ],
      popover: {
        image: [
          ['imagesize', ['imageSize100', 'imageSize50', 'imageSize25']],
          ['float', ['floatLeft', 'floatRight', 'floatNone']],
          ['remove', ['removeMedia']]
        ]
      },
      buttons: {
        send: SendButton
      }
    });    
  }  

  submit() {
    event.preventDefault();
    this.onSubmit.emit('');
    $('#editor').summernote('code', '');
  }

}
