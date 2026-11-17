import { Injectable, inject, signal } from '@angular/core';
import { FileService } from '../services/file.service';
import { DrivesService } from '../services/drives.service';
import { ToastService, errorMessage } from '../services/toast.service';
import { UserService } from '../services/user.service';
import { FileRow } from './file-table.component';
import { saveBlob } from './file-utils';

/**
 * Download / delete handling shared by the "My Files" and per-drive pages.
 * Provide it at component level so each page gets its own `busy` map.
 */
@Injectable()
export class FileActions {
  private files = inject(FileService);
  private users = inject(UserService);
  private drives = inject(DrivesService);
  private toast = inject(ToastService);

  readonly busy = signal<Record<string, 'download' | 'delete' | undefined>>({});

  private setBusy(key: string, v: 'download' | 'delete' | undefined) {
    this.busy.update((b) => ({ ...b, [key]: v }));
  }

  download(row: FileRow): void {
    this.setBusy(row.key, 'download');
    this.files.download(row.drive, row.storagePath, this.users.getUserId()).subscribe({
      next: (blob) => {
        this.setBusy(row.key, undefined);
        saveBlob(blob, row.name);
      },
      error: (err) => {
        this.setBusy(row.key, undefined);
        this.toast.error('Download failed', errorMessage(err));
      },
    });
  }

  delete(row: FileRow, onDeleted: () => void): void {
    this.setBusy(row.key, 'delete');
    this.files.delete(row.drive, row.storagePath, this.users.getUserId()).subscribe({
      next: () => {
        this.setBusy(row.key, undefined);
        this.toast.success('File deleted', row.name);
        this.drives.refresh(row.drive);
        onDeleted();
      },
      error: (err) => {
        this.setBusy(row.key, undefined);
        this.toast.error('Delete failed', errorMessage(err));
      },
    });
  }
}
