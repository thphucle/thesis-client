import {BrowserModule} from "@angular/platform-browser";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";


import {AuthenticateService} from "app/shared-services/authenticate.service";
import {HttpService} from "app/shared-services/http.service";
import {WindowRef,GlobalService} from "app/shared-services/global.service";
import {MetaService} from 'app/shared-services/api/meta.service';
import {ImageService} from 'app/shared-services/api/image.service';
import {CommissionService} from 'app/shared-services/api/commission.service';
import { PhoneRequestService } from "app/shared-services/api/phone-request.service";

import {AppComponent} from "./app.component";
import {LoginComponent} from "./shared-components/login/login.component";
import {RouterModule, Routes} from "@angular/router";

import { MainPipe } from './shared-pipes';

import {RecaptchaModule} from 'ng-recaptcha';
import { RecaptchaFormsModule } from 'ng-recaptcha/forms';
import { RECAPTCHA_SETTINGS, RecaptchaSettings } from 'ng-recaptcha';

import { SharedModule } from './shared-modules/shared.module'
import {AuthGuard} from "./shared-services/guards/auth.guard";
import {AdminModule} from "./admin/admin.module";
import {UserModule} from "./user/user.module";

import { TaskService } from "./shared-services/api/task.service";
import { UserService } from "./shared-services/api/user.service";
import { SidebarComponent } from "./shared-components/sidebar/sidebar.component";
import { LogoutComponent } from "./shared-components/logout/logout.component";
import { RegisterComponent } from './register/register.component';
import { VerifyComponent } from './verify/verify.component';
import { PasswordForgotComponent } from "app/password-forgot/password-forgot.component";
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { SharedComponents } from "app/shared-components/shared-components.module";
import { NotfoundComponent } from "app/shared-components/notfound/notfound.component";
import { SpinnerService } from "app/shared-modules/spinner-module/spinner.service";
import { HeaderComponent } from "app/shared-components/header/header.component";
import { PanelComponent } from "app/shared-components/panel/panel.component";
import { FooterComponent } from "app/shared-components/footer/footer.component";
import { LayoutService } from "app/shared-services/menu.service";
import { QRCodeModule } from "angular2-qrcode";
import { IcoPackageService } from "app/shared-services/api/ico-package.service";
import { ExchangeModule } from "app/exchange/exchange.module";
import { SupportModule } from "app/support-staff/support.module";

const appRoutes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: LoginComponent
  }, {
    path: 'register',
    component: RegisterComponent
  }, {
    path: 'verify',
    component: VerifyComponent
  },
  {
    path: 'logout',
    component: LogoutComponent
  },
  {path: '**', component: NotfoundComponent},

];

const appServices = [
  TaskService, UserService, PhoneRequestService, LayoutService
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SidebarComponent,
    RegisterComponent,
    PanelComponent,
    HeaderComponent,
    FooterComponent,
    VerifyComponent,
    PasswordResetComponent,
    PasswordForgotComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    RecaptchaModule.forRoot(),
    RecaptchaFormsModule,
    SharedModule,
    SharedComponents,
    QRCodeModule,
    MainPipe,
    HttpClientModule,
    RouterModule.forRoot(appRoutes),
    UserModule,
    AdminModule,
    ExchangeModule,
    SupportModule
  ],
  providers: [
    WindowRef,
    GlobalService,
    AuthenticateService,
    HttpService,
    MetaService,
    ImageService,
    SpinnerService,
    IcoPackageService,
    AuthGuard, ...appServices,
    {
      provide: RECAPTCHA_SETTINGS,
      useValue: { siteKey: '6LfYMDcUAAAAABPGd5RMmC1YAnXcsuAo-nLikFlp', theme: 'light' } as RecaptchaSettings,
    }
  ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
