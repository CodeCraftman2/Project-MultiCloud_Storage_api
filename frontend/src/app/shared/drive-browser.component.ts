import { HttpEventType } from '@angular/common/http';
import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from './icon.component';
import { FileRow, FileTableComponent } from './file-table.component';
import { FileActions } from './file-actions';
import { formatBytes, percent } from './file-utils';
import { DriveFile, DriveKey, FileService } from '../services/file.service';
import { DrivesService } from '../services/drives.service';
import { ToastService, errorMessage } from '../services/toast.service';
import { UserService } from '../services/user.service';

/** Full page for one cloud drive: account + quota header and a live file listing. */
@Component({
  selector: 'app-drive-browser',
  standalone: true,
  imports: [IconComponent, FileTableComponent, RouterLink],
  providers: [FileActions],
  templateUrl: './drive-browser.component.html',
  styleUrl: './drive-browser.component.css',
})
export class DriveBrowserComponent implements OnInit {
  @Input({ required: true }) driveKey!: DriveKey;

  private fileService = inject(FileService);
  private users = inject(UserService);
  private toast = inject(ToastService);
  readonly drives = inject(DrivesService);
  readonly actions = inject(FileActions);

  readonly formatBytes = formatBytes;
  readonly files = signal<DriveFile[]>([]);
  readonly state = signal<'loading' | 'loaded' | 'error'>('loading');
  readonly errorText = signal('');
  readonly uploadProgress = signal<number | null>(null);

  readonly drive = computed(() => this.drives.get(this.driveKey)());
  readonly pct = computed(() => percent(this.drive().used, this.drive().total));
  readonly free = computed(() => {
    const d = this.drive();
    return d.total && d.used !== null ? d.total - d.used : null;
  });

  readonly rows = computed<FileRow[]>(() =>
    this.files().map((f) => ({
      key: f.storagePath,
      name: f.fileName,
      type: f.fileType,
      size: Number(f.fileSize) || 0,
      createdAt: f.createdAt,
      drive: this.driveKey,
      storagePath: f.storagePath,
    }))
  );

  ngOnInit(): void {
    if (this.drive().state === 'idle') this.drives.refresh(this.driveKey);
    this.load();
  }

  load(): void {
    this.state.set('loading');
    this.fileService.list(this.driveKey, this.users.getUserId()).subscribe({
      next: (files) => {
        this.files.set(files ?? []);
        this.state.set('loaded');
      },
      error: (err) => {
        this.errorText.set(errorMessage(err));
        this.state.set('error');
      },
    });
  }

  refresh(): void {
    this.drives.refresh(this.driveKey);
    this.load();
  }

  connect(): void {
    this.drives.connect(this.driveKey);
  }

  onDelete(row: FileRow): void {
    this.actions.delete(row, () => this.files.update((list) => list.filter((f) => f.storagePath !== row.storagePath)));
  }

  onUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.uploadProgress.set(0);
    this.fileService.uploadWithProgress(this.driveKey, file, this.users.getUserId()).subscribe({
      next: (ev) => {
        if (ev.type === HttpEventType.UploadProgress && ev.total) {
          this.uploadProgress.set(Math.round((ev.loaded / ev.total) * 90));
        } else if (ev.type === HttpEventType.Response) {
          this.uploadProgress.set(null);
          this.toast.success('Upload complete', `${file.name} → ${this.drive().name}`);
          this.refresh();
        }
      },
      error: (err) => {
        this.uploadProgress.set(null);
        this.toast.error('Upload failed', errorMessage(err));
      },
    });
  }
}
