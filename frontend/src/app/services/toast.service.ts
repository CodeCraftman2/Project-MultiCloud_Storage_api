import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private seq = 0;
  readonly toasts = signal<Toast[]>([]);

  show(kind: ToastKind, title: string, message?: string, durationMs = 4500): void {
    const id = ++this.seq;
    this.toasts.update((list) => [...list, { id, kind, title, message }].slice(-5));
    if (durationMs > 0) setTimeout(() => this.dismiss(id), durationMs);
  }

  success(title: string, message?: string) { this.show('success', title, message); }
  error(title: string, message?: string) { this.show('error', title, message, 7000); }
  info(title: string, message?: string) { this.show('info', title, message); }
  warning(title: string, message?: string) { this.show('warning', title, message, 6000); }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}

/** Best-effort readable message out of an HttpErrorResponse (or anything else). */
export function errorMessage(err: any): string {
  if (!err) return 'Unknown error';
  if (err.status === 0) return 'Cannot reach the backend. Is the Spring Boot server running on port 8080?';
  const body = err.error;
  if (typeof body === 'string' && body.trim()) return body;
  if (body?.error) return body.error;
  if (body?.message) return body.message;
  return err.message ?? String(err);
}
