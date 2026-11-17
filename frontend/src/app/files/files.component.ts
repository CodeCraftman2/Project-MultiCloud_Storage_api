import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../shared/icon.component';
import { FileRow, FileTableComponent } from '../shared/file-table.component';
import { FileActions } from '../shared/file-actions';
import { DriveKey } from '../services/file.service';
import { errorMessage } from '../services/toast.service';
import { UserFile, UserService } from '../services/user.service';

@Component({
  selector: 'app-files',
  standalone: true,
  imports: [IconComponent, FileTableComponent, RouterLink],
  providers: [FileActions],
  templateUrl: './files.component.html',
  styleUrl: './files.component.css',
})
export class FilesComponent implements OnInit {
  private userService = inject(UserService);
  readonly actions = inject(FileActions);

  readonly files = signal<UserFile[]>([]);
  readonly state = signal<'loading' | 'loaded' | 'error'>('loading');
  readonly errorText = signal('');
  readonly driveFilter = signal<'all' | DriveKey>('all');

  readonly rows = computed<FileRow[]>(() =>
    this.files()
      .map((f) => ({
        key: String(f.fileId),
        name: f.fileName,
        type: f.fileType,
        size: Number(f.fileSize) || 0,
        createdAt: f.createdAt,
        drive: (f.driveId === 2 ? 'onedrive' : 'google') as DriveKey,
        storagePath: f.storagePath,
      }))
      .filter((r) => this.driveFilter() === 'all' || r.drive === this.driveFilter())
  );

  readonly counts = computed(() => ({
    all: this.files().length,
    google: this.files().filter((f) => f.driveId !== 2).length,
    onedrive: this.files().filter((f) => f.driveId === 2).length,
  }));

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.state.set('loading');
    this.userService.getFilesByUserId(this.userService.getUserId()).subscribe({
      next: (data) => {
        this.files.set(data ?? []);
        this.state.set('loaded');
      },
      error: (err) => {
        this.errorText.set(errorMessage(err));
        this.state.set('error');
      },
    });
  }

  onDelete(row: FileRow): void {
    this.actions.delete(row, () => this.files.update((list) => list.filter((f) => String(f.fileId) !== row.key)));
  }
}
