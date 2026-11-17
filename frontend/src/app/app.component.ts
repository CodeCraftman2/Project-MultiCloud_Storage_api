import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { StatusbarComponent } from './statusbar/statusbar.component';
import { ToastsComponent } from './toasts/toasts.component';
import { DrivesService } from './services/drives.service';
import { StatusService } from './services/status.service';
import { UserService } from './services/user.service';

export interface PageInfo {
  title: string;
  parent?: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, StatusbarComponent, ToastsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'cloudstorageapi_ui';

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private status = inject(StatusService);
  private users = inject(UserService);
  private drives = inject(DrivesService);

  readonly navOpen = signal(false);

  private readonly nav = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => {
        let r = this.route.firstChild;
        while (r?.firstChild) r = r.firstChild;
        const data = r?.snapshot.data ?? {};
        return {
          url: e.urlAfterRedirects,
          page: { title: data['title'] ?? '', parent: data['parent'] } as PageInfo,
        };
      })
    )
  );

  isAuthPage(): boolean {
    const url = this.nav()?.url ?? this.router.url;
    return /\/(login|register)(\?|$)/.test(url);
  }

  page(): PageInfo {
    return this.nav()?.page ?? { title: '' };
  }

  ngOnInit(): void {
    this.status.startMonitoring();
    if (this.users.isLoggedIn()) {
      this.users.loadCurrentUser();
      this.drives.refreshAll();
    }
  }

  /** Coming back to the tab (e.g. after connecting a drive) refreshes drive status. */
  @HostListener('window:focus')
  onFocus(): void {
    if (this.users.isLoggedIn() && this.drives.all().some((d) => d.state !== 'connected' && d.state !== 'loading')) {
      this.drives.refreshAll();
    }
  }
}
