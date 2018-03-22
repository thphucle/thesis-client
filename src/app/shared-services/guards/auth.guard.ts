import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {AuthenticateService} from "app/shared-services/authenticate.service";
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authenService: AuthenticateService, private router: Router) {
    
  }

  canActivate(next: ActivatedRouteSnapshot,
              state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    
    if (!this.authenService.token) {
      this.authenService.redirectUrl = state.url;
      let redirectUrl = '/login';
      this.router.navigateByUrl(redirectUrl);
      return false;
    }

    console.log("AuthGuard ", true);

    return true;
  }
}

@Injectable()
export class AuthAdminGuard implements CanActivate {
  constructor(private authenService: AuthenticateService, private router: Router) {
    
  }

  canActivate(next: ActivatedRouteSnapshot,
              state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        
    if (this.authenService.account) {
      let role = this.authenService.account.role;      
      if (role === 'admin') {
        return true;
      }
      
      this.router.navigate(['']);
      return false;
    }
    
    return false;
  }
}
