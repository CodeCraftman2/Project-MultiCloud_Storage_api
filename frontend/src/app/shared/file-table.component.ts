import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from './icon.component';
import { fileKind, formatBytes, typeLabel } from './file-utils';
import { DriveKey } from '../services/file.service';

export interface FileRow {
  key: string;
  name: string;
  type: string | null | undefined;
  size: number;
  createdAt: string | null;
  drive: DriveKey;
  storagePath: string;
}

type SortKey = 'name' | 'size' | 'createdAt';

/** Searchable, sortable file table with download/delete actions. */
@Component({
  selector: 'app-file-table',
  standalone: true,
  imports: [IconComponent, FormsModule, DatePipe],
  templateUrl: './file-table.component.html',
  styleUrl: './file-table.component.css',
})
export class FileTableComponent {
  @Input() set rows(value: FileRow[]) { this._rows.set(value ?? []); }
  @Input() state: 'loading' | 'loaded' | 'error' = 'loading';
  @Input() errorText = '';
  @Input() showDrive = false;
  @Input() busy: Record<string, 'download' | 'delete' | undefined> = {};
  @Input() emptyTitle = 'No files yet';
  @Input() emptyText = 'Upload a file from the dashboard to see it here.';

  @Output() download = new EventEmitter<FileRow>();
  @Output() remove = new EventEmitter<FileRow>();
  @Output() retry = new EventEmitter<void>();

  readonly fileKind = fileKind;
  readonly formatBytes = formatBytes;
  readonly typeLabel = typeLabel;

  private readonly _rows = signal<FileRow[]>([]);
  readonly query = signal('');
  readonly sortKey = signal<SortKey>('createdAt');
  readonly sortDir = signal<1 | -1>(-1);
  readonly confirming = signal<string | null>(null);

  readonly visible = computed(() => {
    const q = this.query().trim().toLowerCase();
    const key = this.sortKey();
    const dir = this.sortDir();
    return this._rows()
      .filter((r) => !q || r.name.toLowerCase().includes(q) || (r.type ?? '').toLowerCase().includes(q))
      .sort((a, b) => {
        const av = a[key] ?? '';
        const bv = b[key] ?? '';
        return (typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))) * dir;
      });
  });

  readonly total = computed(() => this._rows().length);
  readonly totalSize = computed(() => this._rows().reduce((s, r) => s + (Number(r.size) || 0), 0));

  sort(key: SortKey): void {
    if (this.sortKey() === key) this.sortDir.set(this.sortDir() === 1 ? -1 : 1);
    else {
      this.sortKey.set(key);
      this.sortDir.set(key === 'name' ? 1 : -1);
    }
  }

  askDelete(row: FileRow): void {
    this.confirming.set(row.key);
  }

  confirmDelete(row: FileRow): void {
    this.confirming.set(null);
    this.remove.emit(row);
  }

  driveLogo(d: DriveKey): string {
    return d === 'onedrive' ? 'onedrive.png' : 'googledrive.png';
  }
}
