/** Human-readable byte size, e.g. 1536 -> "1.5 KB". */
export function formatBytes(bytes: number | null | undefined, decimals = 1): string {
  if (bytes === null || bytes === undefined || isNaN(bytes)) return '—';
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : decimals)} ${units[i]}`;
}

export interface FileKind {
  cls: string;
  label: string;
}

/** Map a MIME type / file name to a coloured icon class and a short label. */
export function fileKind(type?: string | null, name?: string | null): FileKind {
  const t = (type ?? '').toLowerCase();
  const ext = (name ?? '').split('.').pop()?.toLowerCase() ?? '';
  if (t === 'folder' || t.includes('folder')) return { cls: 'folder', label: 'DIR' };
  if (t.includes('pdf') || ext === 'pdf') return { cls: 'pdf', label: 'PDF' };
  if (t.startsWith('image') || ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return { cls: 'img', label: 'IMG' };
  if (t.startsWith('video') || ['mp4', 'mov', 'mkv', 'avi', 'webm'].includes(ext)) return { cls: 'vid', label: 'VID' };
  if (t.includes('sheet') || t.includes('excel') || ['xls', 'xlsx', 'csv'].includes(ext)) return { cls: 'sheet', label: 'XLS' };
  if (t.includes('word') || t.includes('document') || ['doc', 'docx', 'txt', 'md', 'rtf'].includes(ext)) return { cls: 'doc', label: 'DOC' };
  if (t.includes('zip') || t.includes('compressed') || ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return { cls: 'zip', label: 'ZIP' };
  if (t.includes('json') || t.includes('javascript') || t.includes('java') || t.includes('python') || t.includes('xml') ||
      ['js', 'ts', 'java', 'py', 'json', 'html', 'css', 'xml', 'sql'].includes(ext)) return { cls: 'code', label: ext ? ext.slice(0, 4).toUpperCase() : 'CODE' };
  return { cls: '', label: ext ? ext.slice(0, 4).toUpperCase() : 'FILE' };
}

/** Friendly MIME label for the table's "Type" column. */
export function typeLabel(type?: string | null): string {
  if (!type) return '—';
  if (type === 'folder' || type === 'file') return type[0].toUpperCase() + type.slice(1);
  const sub = type.split('/').pop() ?? type;
  if (sub.startsWith('vnd.google-apps.')) return 'Google ' + sub.replace('vnd.google-apps.', '');
  if (sub.includes('openxmlformats')) {
    if (sub.includes('word')) return 'Word document';
    if (sub.includes('sheet')) return 'Excel sheet';
    if (sub.includes('presentation')) return 'PowerPoint';
  }
  return sub.length > 24 ? sub.slice(0, 22) + '…' : sub;
}

/** Trigger a browser download for a blob. */
export function saveBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function percent(used: number | null, total: number | null): number | null {
  if (used === null || !total) return null;
  return Math.min(100, Math.round((used / total) * 1000) / 10);
}
