import { DatePipe } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../shared/icon.component';
import { fileKind, formatBytes, percent } from '../shared/file-utils';
import { DriveKey, FileService } from '../services/file.service';
import { DriveInfo, DrivesService } from '../services/drives.service';
import { StatusService } from '../services/status.service';
import { ToastService, errorMessage } from '../services/toast.service';
import { UserFile, UserService } from '../services/user.service';

interface UploadItem {
  id: number;
  name: string;
  size: number;
  drive: DriveKey;
  progress: number;
  state: 'uploading' | 'done' | 'error';
  error?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IconComponent, RouterLink, DatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private fileService = inject(FileService);
  private toast = inject(ToastService);
  readonly users = inject(UserService);
  readonly drives = inject(DrivesService);
  readonly status = inject(StatusService);

  readonly formatBytes = formatBytes;
  readonly fileKind = fileKind;
  readonly percent = percent;

  readonly files = signal<UserFile[]>([]);
  readonly filesState = signal<'loading' | 'loaded' | 'error'>('loading');
  readonly recentFiles = computed(() =>
    [...this.files()].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '')).slice(0, 5)
  );
  readonly recentActivity = computed(() => this.status.log().slice(0, 6));

  readonly targets = signal<Record<DriveKey, boolean>>({ google: true, onedrive: false });
  readonly dragging = signal(false);
  readonly uploads = signal<UploadItem[]>([]);
  readonly uploading = computed(() => this.uploads().some((u) => u.state === 'uploading'));
  private seq = 0;

  readonly greeting = computed(() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  });

  ngOnInit(): void {
    if (!this.users.getUserId()) {
      this.router.navigate(['multicloudstorageapi/login']);
      return;
    }
    // Drive status is loaded app-wide; only refresh if it has never loaded.
    if (this.drives.all().every((d) => d.state === 'idle')) this.drives.refreshAll();
    this.loadFiles();
  }

  loadFiles(): void {
    this.filesState.set('loading');
    this.users.getFilesByUserId(this.users.getUserId()).subscribe({
      next: (files) => {
        this.files.set(files ?? []);
        this.filesState.set('loaded');
      },
      error: () => this.filesState.set('error'),
    });
  }

  refresh(): void {
    this.status.ping();
    this.drives.refreshAll();
    this.loadFiles();
  }

  openDrive(d: DriveInfo): void {
    this.router.navigateByUrl(d.route);
  }

  connect(d: DriveInfo, event?: Event): void {
    event?.stopPropagation();
    this.drives.connect(d.key);
  }

  toggleTarget(key: DriveKey): void {
    this.targets.update((t) => ({ ...t, [key]: !t[key] }));
  }

  driveName(key: DriveKey): string {
    return key === 'google' ? 'Google Drive' : 'OneDrive';
  }

  // ---- Upload ----

  openFileChooser(input: HTMLInputElement): void {
    input.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.startUploads(Array.from(input.files ?? []));
    input.value = '';
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.dragging.set(true);
  }

  onDragLeave(e: DragEvent): void {
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) this.dragging.set(false);
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.dragging.set(false);
    this.startUploads(Array.from(e.dataTransfer?.files ?? []));
  }

  private startUploads(files: File[]): void {
    if (!files.length) return;
    const t = this.targets();
    const keys = (Object.keys(t) as DriveKey[]).filter((k) => t[k]);
    if (!keys.length) {
      this.toast.warning('Choose a destination', 'Select Google Drive, OneDrive, or both before uploading.');
      return;
    }
    const notConnected = keys.filter((k) => this.drives.get(k)().state !== 'connected');
    if (notConnected.length) {
      this.toast.warning(
        `${notConnected.map((k) => this.driveName(k)).join(' & ')} not connected`,
        'Connect the drive first, or untick it as a destination.'
      );
      return;
    }
    for (const file of files) {
      for (const key of keys) this.upload(file, key);
    }
  }

  private upload(file: File, drive: DriveKey): void {
    const id = ++this.seq;
    this.uploads.update((list) => [
      { id, name: file.name, size: file.size, drive, progress: 0, state: 'uploading' },
      ...list,
    ]);
    const patch = (p: Partial<UploadItem>) =>
      this.uploads.update((list) => list.map((u) => (u.id === id ? { ...u, ...p } : u)));

    this.fileService.uploadWithProgress(drive, file, this.users.getUserId()).subscribe({
      next: (ev) => {
        if (ev.type === HttpEventType.UploadProgress && ev.total) {
          // Network transfer is ~90% of the work; the backend still forwards it to the cloud.
          patch({ progress: Math.round((ev.loaded / ev.total) * 90) });
        } else if (ev.type === HttpEventType.Response) {
          patch({ progress: 100, state: 'done' });
          this.toast.success('Upload complete', `${file.name} → ${this.driveName(drive)}`);
          this.loadFiles();
          this.drives.refresh(drive);
        }
      },
      error: (err) => {
        const msg = errorMessage(err);
        patch({ state: 'error', error: msg });
        this.toast.error(`Upload to ${this.driveName(drive)} failed`, msg);
      },
    });
  }

  clearFinished(): void {
    this.uploads.update((list) => list.filter((u) => u.state === 'uploading'));
  }
}
