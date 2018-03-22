import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthenticateService } from 'app/shared-services/authenticate.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  user:any;
  private $destroy = new Subject();
  constructor(
    protected auth: AuthenticateService,
    protected router: Router
  ) { }

  ngOnInit() {
    
    this.auth
    .change
    .takeUntil(this.$destroy)
    .subscribe((auth: AuthenticateService) => {
      if (!auth) {
        this.user = null;
        return;
      }

      this.user = auth.account;
    });
  }

  ngOnDestroy() {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  signOut() {
    this.auth.clear();
    this.router.navigate(['login']);
  }

}
