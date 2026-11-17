import { Component, EventEmitter, Output, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent, IconName } from '../shared/icon.component';
import { DrivesService } from '../services/drives.service';
import { formatBytes, percent } from '../shared/file-utils';

interface NavItem {
  label: string;
  icon: IconName;
  link: string;
  exact?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  @Output() navigate = new EventEmitter<void>();

  readonly drives = inject(DrivesService);

  readonly workspace: NavItem[] = [
    { label: 'Dashboard', icon: 'home', link: '/multicloudstorageapi/home', exact: true },
    { label: 'My Files', icon: 'files', link: '/multicloudstorageapi/files' },
  ];
  readonly account: NavItem[] = [
    { label: 'Profile', icon: 'user', link: '/multicloudstorageapi/profile' },
    { label: 'About', icon: 'info', link: '/multicloudstorageapi/about' },
  ];

  readonly usedPct = computed(() => {
    const t = this.drives.totals();
    return percent(t.used, t.total);
  });
  readonly usedText = computed(() => {
    const t = this.drives.totals();
    return t.total ? `${formatBytes(t.used)} of ${formatBytes(t.total)}` : 'No storage data yet';
  });
}
