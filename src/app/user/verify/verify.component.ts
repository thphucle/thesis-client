import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FileUploadItem } from 'app/shared-modules/fileupload/fileupload.component';
import { ImageService } from 'app/shared-services/api/image.service';
import { AuthenticateService } from 'app/shared-services/authenticate.service';
import { Subject } from 'rxjs/Subject';
import { query, trigger, style, transition, animate, group, stagger } from '@angular/animations';
import { IdentityRequestService } from 'app/shared-services/api/identity-request.service';

type Orientation = ( "prev" | "next" | "none" );

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss'],
  animations: [
    trigger(
      "stepAnimation",
      [
        transition(
          "void => prev",
          [            
            style({
              left: -100,
              opacity: 0.0,
              zIndex: 2
            }),
            animate(
              "600ms cubic-bezier(0.23, 1, 0.32, 1)",
              style({
                left: 0,
                opacity: 1.0,
                zIndex: 2
              })
            )
          ]
        ),
        transition(
          "prev => void",
          [
            animate(
              "600ms cubic-bezier(0.23, 1, 0.32, 1)",
              style({
                left: 100,
                opacity: 0.0,
                zIndex: 0
              })
            )
          ]
        ),
        transition(
          "void => next", [
            style({
              left: 100,
              opacity: 0.0,
              zIndex: 2
            }),
            animate(
              "600ms cubic-bezier(0.23, 1, 0.32, 1)",
              style({
                left: 0,
                opacity: 1.0,
                zIndex: 2
              })
            )
          ]
        ),
        transition(
          "next => void",
          [
            animate(
              "600ms cubic-bezier(0.23, 1, 0.32, 1)",
              style({
                left: -100,
                opacity: 0.0,
                zIndex: 0
              })
            )
          ]
        )
      ]
    )
  ]
})
export class VerifyComponent implements OnInit {
  idImages: Array<FileUploadItem> = [];
  faceIdImages: Array<FileUploadItem> = [];
  textIdImages: Array<FileUploadItem> = [];
  identityRequest;
  identityRequestImage = {
    'national_ident': '',
    'face_ident': '',
    'text_ident': ''
  }

  formData = {
    nid: ''
  };

  currentStep = 0;
  orientation: Orientation;

  disableNextBtn = true;

  submitPromise: Promise<any>;
  private $destroy = new Subject();
  uploadTextConfig = {
    button: 'Select File',
    zone: 'Drop File Here'
  };

  user;
  constructor(
    protected imageService: ImageService,
    protected identReqService: IdentityRequestService,
    protected auth: AuthenticateService,
    protected changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.auth.change
      .takeUntil(this.$destroy)
      .subscribe(async (auth: AuthenticateService) => {
        if (!auth) return;
        this.user = auth.account;
        if (this.user.identity_status == 'pending' || this.user.identity_status == 'rejected') {
          let identReqRs = await this.identReqService.myIdentityRequest(this.user.id);
          if (identReqRs.error) {
            return toastr.error(identReqRs.error.message, 'Load identity verification failed');
          }
          if (Array.isArray(identReqRs.data)) {
            this.identityRequest = identReqRs.data[0];
          } else {
            this.identityRequest = identReqRs.data;
          }
          this.disableNextBtn = false;
          this.setImages();
          
        }
        this.currentStep = 0;
        this.nextStep();
      });

  }

  filesChange(files: Array<FileUploadItem>, photoType: string) {
    if (photoType == 'id') {
      this.idImages = files.slice(-1);
      this.nidChange();
    } else if (photoType == 'face') {
      this.faceIdImages = files.slice(-1);
      this.disableNextBtn = this.faceIdImages.length ? false : true;
    } else if (photoType == 'text') {
      this.textIdImages = files.slice(-1);
      this.disableNextBtn = this.textIdImages.length ? false : true;
    } else {
      this.disableNextBtn = true;
    }
  }

  nidChange() {
    if (this.formData.nid && this.idImages.length) {
      this.disableNextBtn = false;
    } else {
      this.disableNextBtn = true;
    }
  }

  nextStep() {
    this.orientation = 'next';
    this.changeDetectorRef.detectChanges();
    this.currentStep++;
    if(this.user.identity_status == 'pending' || this.user.identity_status == 'rejected') {
      this.disableNextBtn = false;
      return;
    }
    /*If faceIdImages was submited, enable nextButton for 3rd-step, but now disalbe because need only 2 Step*/
    /*if (this.currentStep == 2) {
      this.disableNextBtn = this.faceIdImages[0] ? false : true;
    }*/
  }

  prevStep() {
    this.orientation = 'prev';
    this.changeDetectorRef.detectChanges();
    this.currentStep--;
    this.disableNextBtn = false;
  }

  setImages() {
    this.identityRequest.IdentityImages.forEach(identImg => {
      let imgs;
      this.identityRequestImage[identImg.type] = identImg.Image.src;
      this.idImages = [];
      this.faceIdImages = [];
      this.textIdImages = [];
    });

    this.formData.nid = this.identityRequest.document_number;
  }

  async createIdentReq() {
    let idFiles = this.idImages.map((f: FileUploadItem) => f.file);
    let faceIdFiles = this.faceIdImages.map((f: FileUploadItem) => f.file);
    let textIdFiles = this.textIdImages.map((f: FileUploadItem) => f.file);

    let files = idFiles.concat(faceIdFiles).concat(textIdFiles);    
    if (files.length < 2) {
      return Promise.reject('Not enough pictures');
    }
    
    if (!this.formData.nid) {
      return Promise.reject('Please enter document number');
    }

    let rs = await this.imageService.create(files);
    if (rs.error) {
      return Promise.reject('Upload images failed');
    }
    
    let imagesRecord = rs.data;
    let identRs = await this.identReqService.create({
      note: '',
      document_number: this.formData.nid,
      images: [
        {
          image_id: imagesRecord[0].id,
          type: 'national_ident'
        },
        {
          image_id: imagesRecord[1].id,
          type: 'face_ident'
        }
        // {
        //   image_id: imagesRecord[2].id,
        //   type: 'text_ident'
        // }
      ]
    });

    return identRs;
  }

  async updateIdentReq() {    

    let idFiles = this.idImages.filter(f => !f.id).map((f: FileUploadItem) => f.file);
    let faceIdFiles = this.faceIdImages.filter(f => !f.id).map((f: FileUploadItem) => f.file);
    let textIdFiles = this.textIdImages.filter(f => !f.id).map((f: FileUploadItem) => f.file);

    let imageTypes = [];
    if (idFiles.length) {
      imageTypes.push('national_ident');
    }

    if (faceIdFiles.length) {
      imageTypes.push('face_ident');
    }

    if (textIdFiles.length) {
      imageTypes.push('text_ident');
    }

    if (!this.formData.nid) {
      return Promise.reject('Please enter document number');
    }
    
    let files = idFiles.concat(faceIdFiles).concat(textIdFiles);
    let imagesRecord = [];

    if (files.length) {
      let rs = await this.imageService.create(files);
      if (rs.error) {
        return Promise.reject(rs.error.message + '\n' + 'Upload images failed');
      }
      
      imagesRecord = rs.data;
    }

    let identRs = await this.identReqService.update(this.identityRequest.id, {      
      document_number: this.formData.nid,
      images: imageTypes.map((t, index) => ({
        image_id: imagesRecord[index].id,
        type: t
      }))
    });

    return identRs;
  }

  async submit() {
    if (this.identityRequest) {
      this.submitPromise = this.updateIdentReq();
    } else {
      this.submitPromise = this.createIdentReq();
    }

    this.submitPromise.then(rs => {
      if (rs.error) {
        return toastr.error(rs.error.message, 'Submit identity verification information failed');
      }

      let account = this.auth.account;
      account.identity_status = rs.data.status;
      console.log('1');
      this.auth.updateInfo(this.auth.token, account);
      
      let identReq = rs.data;
      this.identityRequest = identReq;
      console.log('2');
      this.setImages();
      console.log('3');
      return toastr.success('Success');
    }).catch(error => {
      console.log('Here.s error');
      return toastr.error(error);
    });
    
  }
}
