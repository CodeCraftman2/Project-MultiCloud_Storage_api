import { DatePipe } from '@angular/common';
import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IconComponent } from '../shared/icon.component';
import { DrivesService } from '../services/drives.service';
import { ToastService, errorMessage } from '../services/toast.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent, DatePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  readonly userService = inject(UserService);
  readonly drives = inject(DrivesService);

  readonly isPasswordVisible = signal(false);
  readonly saving = signal(false);
  userId = 0;

  // The backend re-hashes whatever password it receives, so the form never pre-fills the stored
  // hash (sending it back would lock the user out). Saving always requires a password.
  readonly userForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    passwordHash: ['', [Validators.required, Validators.minLength(4)]],
  });

  constructor() {
    // Fill the form whenever the shared current user (re)loads.
    effect(() => {
      const u = this.userService.currentUser();
      if (u && !this.userForm.dirty) {
        this.userForm.patchValue({ username: u.username, email: u.email });
      }
    });
  }

  ngOnInit(): void {
    this.userId = this.userService.getUserId();
    this.getCurrentUserDetails();
  }

  getCurrentUserDetails(): void {
    this.userService.loadCurrentUser();
  }

  reset(): void {
    const u = this.userService.currentUser();
    this.userForm.reset({ username: u?.username ?? '', email: u?.email ?? '', passwordHash: '' });
  }

  updateUserDetails(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.userService.update(this.userId, { userId: this.userId, ...this.userForm.getRawValue() }).subscribe({
      next: (response) => {
        this.saving.set(false);
        if (response?.isUpdated) {
          this.toast.success('Profile updated', 'Your changes have been saved.');
          this.userForm.markAsPristine();
          this.userForm.controls.passwordHash.reset('');
          this.userService.loadCurrentUser();
        } else {
          this.toast.error('Update failed', 'Try different details.');
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error('Update failed', errorMessage(err));
      },
    });
  }

  toggleVisibility(): void {
    this.isPasswordVisible.update((v) => !v);
  }

  invalid(name: 'username' | 'email' | 'passwordHash'): boolean {
    const c = this.userForm.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }
}
