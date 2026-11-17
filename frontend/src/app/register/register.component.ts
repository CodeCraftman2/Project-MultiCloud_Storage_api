import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../shared/icon.component';
import { AuthSideComponent } from '../login/auth-side.component';
import { StatusService } from '../services/status.service';
import { ToastService, errorMessage } from '../services/toast.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, IconComponent, AuthSideComponent],
  templateUrl: './register.component.html',
  styleUrl: '../login/login.component.css',
})
export class RegisterComponent {
  private userService = inject(UserService);
  private router = inject(Router);
  private toast = inject(ToastService);
  readonly status = inject(StatusService);

  confpwd = '';
  user = { username: '', passwordHash: '', email: '' };

  readonly showPassword = signal(false);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly touched = signal(false);

  get strength(): number {
    const p = this.user.passwordHash;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return Math.max(1, s);
  }

  get strengthLabel(): string {
    return ['', 'Weak', 'Fair', 'Good', 'Strong'][this.strength];
  }

  get emailValid(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.user.email.trim());
  }

  get mismatch(): boolean {
    return !!this.confpwd && this.confpwd !== this.user.passwordHash;
  }

  onSubmit(): void {
    this.touched.set(true);
    const { username, email, passwordHash } = this.user;
    if (!username.trim() || !email.trim() || !passwordHash || !this.confpwd) {
      this.error.set('All fields are required.');
      return;
    }
    if (!this.emailValid) {
      this.error.set('Enter a valid email address.');
      return;
    }
    if (this.mismatch) {
      this.error.set('Passwords do not match.');
      return;
    }
    this.error.set(null);
    this.submitting.set(true);

    this.userService.register({ username: username.trim(), email: email.trim(), passwordHash }).subscribe({
      next: (response) => {
        this.submitting.set(false);
        if (response?.isSuccess) {
          this.toast.success('Account created', 'You can sign in now.');
          this.router.navigate(['multicloudstorageapi/login']);
        } else {
          this.error.set(response?.message ?? 'Registration failed.');
        }
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(errorMessage(err));
      },
    });
  }
}
