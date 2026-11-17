import { Injectable, computed, inject, signal, WritableSignal } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { DriveKey } from './file.service';
import { GoogledriveService } from './googledrive.service';
import { OnedriveService } from './onedrive.service';
import { UserService } from './user.service';
import { errorMessage } from './toast.service';

export type DriveState = 'idle' | 'loading' | 'connected' | 'disconnected' | 'error';

export interface DriveInfo {
  key: DriveKey;
  id: 1 | 2;
  name: string;
  logo: string;
  route: string;
  state: DriveState;
  email: string | null;
  used: number | null;
  total: number | null;
  quotaLoading: boolean;
  error: string | null;
}

const initial = (key: DriveKey): DriveInfo =>
  key === 'google'
    ? { key, id: 1, name: 'Google Drive', logo: 'googledrive.png', route: '/multicloudstorageapi/home/googledrive',
        state: 'idle', email: null, used: null, total: null, quotaLoading: false, error: null }
    : { key, id: 2, name: 'OneDrive', logo: 'onedrive.png', route: '/multicloudstorageapi/home/onedrive',
        state: 'idle', email: null, used: null, total: null, quotaLoading: false, error: null };

/** Connection + storage status of each cloud drive, shared across the app. */
@Injectable({ providedIn: 'root' })
export class DrivesService {
  private userService = inject(UserService);
  private auth = inject(AuthService);
  private googleSvc = inject(GoogledriveService);
  private oneDriveSvc = inject(OnedriveService);

  private readonly drives: Record<DriveKey, WritableSignal<DriveInfo>> = {
    google: signal(initial('google')),
    onedrive: signal(initial('onedrive')),
  };

  readonly google = this.drives.google.asReadonly();
  readonly onedrive = this.drives.onedrive.asReadonly();
  readonly all = computed(() => [this.google(), this.onedrive()]);
  readonly connectedCount = computed(() => this.all().filter((d) => d.state === 'connected').length);
  readonly totals = computed(() =>
    this.all().reduce(
      (acc, d) => ({ used: acc.used + (d.used ?? 0), total: acc.total + (d.total ?? 0) }),
      { used: 0, total: 0 }
    )
  );

  get(key: DriveKey) {
    return this.drives[key].asReadonly();
  }

  refreshAll(): void {
    this.refresh('google');
    this.refresh('onedrive');
  }

  refresh(key: DriveKey): void {
    if (!this.userService.isLoggedIn()) return;
    const sig = this.drives[key];
    sig.update((d) => ({ ...d, state: 'loading', error: null }));

    this.userService.getDriveStatus(sig().id).subscribe({
      next: (status) => {
        if (!status.connected) {
          sig.update((d) => ({ ...d, state: 'disconnected', email: null, used: null, total: null }));
          return;
        }
        sig.update((d) => ({ ...d, state: 'connected', email: status.email, quotaLoading: true }));
        const quota$: Observable<{ used: number; total: number }> =
          key === 'google' ? this.googleSvc.getQuota(status.accessToken) : this.oneDriveSvc.getQuota(status.accessToken);
        quota$.subscribe({
          next: (q) => sig.update((d) => ({ ...d, used: q.used, total: q.total || null, quotaLoading: false })),
          error: () => sig.update((d) => ({ ...d, quotaLoading: false })),
        });
      },
      error: (err) => sig.update((d) => ({ ...d, state: 'error', error: errorMessage(err) })),
    });
  }

  connect(key: DriveKey): void {
    key === 'google' ? this.auth.initiateGoogleOAuth() : this.auth.initiateOneDriveOAuth();
  }

  reset(): void {
    this.drives.google.set(initial('google'));
    this.drives.onedrive.set(initial('onedrive'));
  }
}
