import { HttpClient, HttpContext, HttpContextToken } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { timeout } from 'rxjs/operators';
import { API_BASE } from './api.config';

/** Set on a request to keep it out of the activity tracker (used by the health ping itself). */
export const SKIP_ACTIVITY = new HttpContextToken<boolean>(() => false);

export type BackendState = 'checking' | 'online' | 'offline';

export interface Activity {
  id: number;
  label: string;
  startedAt: number;
}

export interface ActivityLogEntry {
  id: number;
  label: string;
  ok: boolean;
  status: number;
  ms: number;
  at: Date;
}

/**
 * Live application status: backend reachability + latency, the requests that are
 * currently in flight, and a short history of finished requests.
 */
@Injectable({ providedIn: 'root' })
export class StatusService {
  private http = inject(HttpClient);
  private seq = 0;
  private timer: ReturnType<typeof setInterval> | null = null;

  readonly backend = signal<BackendState>('checking');
  readonly latency = signal<number | null>(null);
  readonly lastChecked = signal<Date | null>(null);
  readonly lastSync = signal<Date | null>(null);
  readonly active = signal<Activity[]>([]);
  readonly log = signal<ActivityLogEntry[]>([]);

  readonly busy = computed(() => this.active().length > 0);
  readonly currentLabel = computed(() => {
    const a = this.active();
    return a.length ? a[a.length - 1].label : null;
  });
  readonly errorCount = computed(() => this.log().filter((e) => !e.ok).length);

  /** Start periodic health checks (idempotent). */
  startMonitoring(intervalMs = 15000): void {
    if (this.timer) return;
    this.ping();
    this.timer = setInterval(() => this.ping(), intervalMs);
  }

  /** Lightweight reachability check against a public endpoint. */
  ping(): void {
    const t0 = performance.now();
    this.http
      .get(`${API_BASE}/users/currentuser`, {
        params: { userId: 0 },
        responseType: 'text',
        context: new HttpContext().set(SKIP_ACTIVITY, true),
      })
      .pipe(timeout(8000))
      .subscribe({
        next: () => this.markOnline(performance.now() - t0),
        // Any HTTP status means the server answered; status 0 / timeout means it didn't.
        error: (e) => (e?.status > 0 ? this.markOnline(performance.now() - t0) : this.markOffline()),
      });
  }

  markOnline(latencyMs?: number): void {
    this.backend.set('online');
    this.lastChecked.set(new Date());
    if (latencyMs !== undefined) this.latency.set(Math.round(latencyMs));
  }

  markOffline(): void {
    this.backend.set('offline');
    this.lastChecked.set(new Date());
    this.latency.set(null);
  }

  begin(label: string): number {
    const id = ++this.seq;
    this.active.update((list) => [...list, { id, label, startedAt: performance.now() }]);
    return id;
  }

  end(id: number, ok: boolean, status: number): void {
    const found = this.active().find((a) => a.id === id);
    this.active.update((list) => list.filter((a) => a.id !== id));
    if (!found) return;
    const entry: ActivityLogEntry = {
      id,
      label: found.label,
      ok,
      status,
      ms: Math.round(performance.now() - found.startedAt),
      at: new Date(),
    };
    this.log.update((list) => [entry, ...list].slice(0, 40));
    if (ok) this.lastSync.set(entry.at);
  }

  clearLog(): void {
    this.log.set([]);
  }
}
