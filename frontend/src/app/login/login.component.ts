import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../shared/icon.component';
import { AuthSideComponent } from './auth-side.component';
import { DrivesService } from '../services/drives.service';
import { StatusService } from '../services/status.service';
import { ToastService, errorMessage } from '../services/toast.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, IconComponent, AuthSideComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private router = inject(Router);
  private userService = inject(UserService);
  private drives = inject(DrivesService);
  private toast = inject(ToastService);
  readonly status = inject(StatusService);

  credentials = { username: '', password: '' };
  readonly showPassword = signal(false);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  register(): void {
    this.router.navigate(['multicloudstorageapi/register']);
  }

  onLogin(): void {
    if (!this.credentials.username.trim() || !this.credentials.password) {
      this.error.set('Enter your username and password.');
      return;
    }
    this.error.set(null);
    this.submitting.set(true);

    this.userService.login(this.credentials.username.trim(), this.credentials.password).subscribe({
      next: (response: any) => {
        this.submitting.set(false);
        if (response?.isAuthenticated) {
          this.userService.loadCurrentUser();
          this.drives.refreshAll();
          this.toast.success('Welcome back!', `Signed in as ${this.credentials.username.trim()}.`);
          this.router.navigate(['multicloudstorageapi/home']);
        } else {
          this.error.set(response?.message ?? 'Invalid credentials.');
        }
      },
      error: (err: any) => {
        this.submitting.set(false);
        this.error.set(errorMessage(err));
      },
    });
  }
}
