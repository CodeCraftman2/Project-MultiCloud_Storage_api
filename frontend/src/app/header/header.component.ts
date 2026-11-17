import { Component, EventEmitter, HostListener, Input, Output, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../shared/icon.component';
import { DrivesService } from '../services/drives.service';
import { StatusService } from '../services/status.service';
import { ToastService } from '../services/toast.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [IconComponent, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  @Input() page: { title: string; parent?: string } = { title: '' };
  @Output() toggleNav = new EventEmitter<void>();

  readonly status = inject(StatusService);
  readonly users = inject(UserService);
  private drives = inject(DrivesService);
  private router = inject(Router);
  private toast = inject(ToastService);

  readonly menuOpen = signal(false);

  refresh(): void {
    this.status.ping();
    this.users.loadCurrentUser();
    this.drives.refreshAll();
  }

  logout(): void {
    this.menuOpen.set(false);
    this.users.clearUserData();
    this.drives.reset();
    this.toast.info('Signed out', 'See you next time.');
    this.router.navigate(['/multicloudstorageapi/login']);
  }

  @HostListener('document:click', ['$event'])
  closeMenu(event: MouseEvent): void {
    if (!(event.target as HTMLElement).closest('.user-menu')) this.menuOpen.set(false);
  }
}
