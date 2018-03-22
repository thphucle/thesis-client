import { Component, OnInit } from '@angular/core';
import { MenuService } from 'app/shared-services/menu.service';
import { Subject } from 'rxjs/Subject';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { AuthenticateService } from 'app/shared-services/authenticate.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  routes: any[] = [];
  private $destroy = new Subject();
  constructor(
    protected menuService: MenuService,
    protected auth: AuthenticateService,
    protected router: Router
  ) { }

  ngOnInit() {
    this.routes = this.menuService.activeRoutes;
    this.menuService
    .onActiveRoutesChange()
    .takeUntil(this.$destroy)
    .subscribe(routes => {
      this.routes = routes;
    });
  }

  ngOnDestroy() {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  signOut() {
    $('html').removeClass('nav-open');
    $('body > .close-layer').remove();
    this.auth.clear();
    this.router.navigate(['login']);
  }

}
