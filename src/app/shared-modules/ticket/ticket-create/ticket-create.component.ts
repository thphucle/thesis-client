import { Component, OnInit } from '@angular/core';
import { TicketService } from "app/shared-services/api/ticket.service";
import { ImageService } from "app/shared-services/api/image.service";
import { Router, ActivatedRoute } from "@angular/router";
import { AuthenticateService } from 'app/shared-services/authenticate.service';
import { UserService } from 'app/shared-services/api/user.service';
import {AutocompleteSetting} from 'app/shared-modules/autocomplete/autocomplete.component';

@Component({
  selector: 'app-ticket-create',
  templateUrl: './ticket-create.component.html',
  styleUrls: ['./ticket-create.component.scss']
})
export class TicketCreateComponent implements OnInit {
  
  ticket: any = {
    title: '',
    message: '',
    image_id: null
  };  

  onProcessing = false;
  isSendTo = false;
  userList:any[] = [];
  autocompleteSetting: AutocompleteSetting = {
    textField: 'username',
    valueField: 'username'
  };

  constructor(
    private ticketService: TicketService,
    private imageService: ImageService,
    private route: Router,
    private auth: AuthenticateService,
    private userService: UserService,
    protected activatedRoute: ActivatedRoute
  ) {
    
  }

  ngOnInit() {
    let role = this.auth.account.role;
    this.isSendTo =  ['admin', 'support'].indexOf(role) > -1;    
    this.loadUserList();

    this.auth.subscribe(() => {
      if (!this.auth.account) return;
      let role = this.auth.account.role;      
      this.isSendTo =  ['admin', 'support'].indexOf(role) > -1      
      this.loadUserList();
    });

    $('#content').summernote({
      minHeight: 300,
      callbacks: {
        onImageUpload: (files, editor, welEditable) => {
          console.log("Run image upload");
          this.uploadImage(files[0]);
        }
      }
      
    });
  }

  async loadUserList() {
    if (!this.isSendTo) return;    
    this.userList = await this.userService.getUserList();
  }

  async submit() {
  
    this.ticket.message = $('#content').summernote('code');
    if (!this.ticket.title || this.ticket.title.length < 10) {
      return toastr.error('Title must be at least 10 characters');
    }

    if (!this.ticket.message || this.ticket.message.length < 10) {
      return toastr.error('Content is too short');
    }
    
    this.onProcessing = true;

    let ticketResp = await this.ticketService.create(this.ticket);
    this.onProcessing = false;
    if (ticketResp.error) {      
      return toastr.error(ticketResp.error.message, 'Create ticket failed');
    }

    this.ticketService.clearCache();
    this.route.navigate(['..'], {relativeTo: this.activatedRoute});
    return toastr.success('Create ticket successfully');
  }

  async uploadImage(file) {
    let imageResp = await this.imageService.create(file);
    if (imageResp.error) {
      return toastr.error(imageResp.error.message, 'Upload image failed');
    }
    
    let image = imageResp.data[0];    
    $('#content').summernote('insertImage', image.medium);
  }

  selectUser(user) {
    this.ticket.to_id = user.id;
  }
  

}
