import { DatePipe } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import { IconComponent } from '../shared/icon.component';
import { API_HOST } from '../services/api.config';
import { DrivesService } from '../services/drives.service';
import { StatusService } from '../services/status.service';
import { UserService } from '../services/user.service';

/** Fixed bottom bar: backend health, live activity, session info and a request log. */
@Component({
  selector: 'app-statusbar',
  standalone: true,
  imports: [IconComponent, DatePipe],
  templateUrl: './statusbar.component.html',
  styleUrl: './statusbar.component.css',
})
export class StatusbarComponent {
  readonly status = inject(StatusService);
  readonly users = inject(UserService);
  readonly drives = inject(DrivesService);
  readonly apiHost = API_HOST;
  readonly logOpen = signal(false);

  @HostListener('document:keydown.escape')
  close(): void {
    this.logOpen.set(false);
  }
}
