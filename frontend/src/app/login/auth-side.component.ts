import { Component, inject } from '@angular/core';
import { IconComponent } from '../shared/icon.component';
import { API_HOST } from '../services/api.config';
import { StatusService } from '../services/status.service';

/** Branded left panel for the login / register pages, with a live system-status card. */
@Component({
  selector: 'app-auth-side',
  standalone: true,
  imports: [IconComponent],
  template: `
    <aside class="side">
      <div class="brand">
        <span class="mark"><app-icon name="cloud" [size]="22" [stroke]="2.2" /></span>
        <span><strong>MultiCloud</strong><small>File Storage</small></span>
      </div>

      <div class="pitch">
        <h2>All your clouds.<br />One place.</h2>
        <p>Upload, browse and manage files across Google Drive and OneDrive from a single dashboard.</p>
        <ul>
          <li><app-icon name="upload" [size]="16" /> Upload to several drives at once</li>
          <li><app-icon name="shield" [size]="16" /> Secure OAuth 2.0 connections</li>
          <li><app-icon name="hard-drive" [size]="16" /> Live storage usage per drive</li>
        </ul>
      </div>

      <div class="sys">
        <div class="sys-title"><app-icon name="activity" [size]="14" /> System status</div>
        <div class="sys-row">
          <span>Backend API</span>
          @switch (status.backend()) {
            @case ('online') { <span class="st ok"><span class="dot ok"></span>Connected</span> }
            @case ('offline') { <span class="st err"><span class="dot err pulse"></span>Unreachable</span> }
            @default { <span class="st"><span class="spinner"></span>Checking…</span> }
          }
        </div>
        <div class="sys-row"><span>Latency</span><span class="mono">{{ status.latency() !== null ? status.latency() + ' ms' : '—' }}</span></div>
        <div class="sys-row"><span>Endpoint</span><span class="mono">{{ host }}</span></div>
        <div class="sys-row"><span>Integrations</span><span class="logos"><img src="googledrive.png" alt="Google Drive" /><img src="onedrive.png" alt="OneDrive" /></span></div>
        @if (status.backend() === 'offline') {
          <button class="retry" (click)="status.ping()"><app-icon name="refresh" [size]="13" /> Retry connection</button>
        }
      </div>
    </aside>
  `,
  styles: [`
    :host { display: block; }
    .side { height: 100%; display: flex; flex-direction: column; gap: 32px; padding: 40px; color: #e9e3ff;
      background: radial-gradient(90% 70% at 10% 0%, rgba(167, 139, 250, .45), transparent 60%),
                  radial-gradient(70% 60% at 100% 100%, rgba(192, 38, 211, .35), transparent 60%), #1a0f3a; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand strong { display: block; font-size: 17px; color: #fff; } .brand small { color: #b7acd9; font-size: 12px; }
    .mark { width: 42px; height: 42px; border-radius: 13px; display: grid; place-items: center; background: var(--brand-gradient); box-shadow: 0 8px 24px rgba(124,58,237,.5); color: #fff; }
    .pitch { margin-top: auto; }
    .pitch h2 { font-size: 34px; font-weight: 800; color: #fff; letter-spacing: -.02em; }
    .pitch p { margin-top: 12px; color: #c8bfe6; max-width: 380px; font-size: 15px; }
    .pitch ul { list-style: none; padding: 0; margin: 22px 0 0; display: grid; gap: 10px; }
    .pitch li { display: flex; align-items: center; gap: 10px; color: #ddd5f7; }
    .pitch li app-icon { color: var(--brand-400); }
    .sys { margin-top: auto; padding: 16px; border-radius: 16px; background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.1); backdrop-filter: blur(6px); }
    .sys-title { display: flex; align-items: center; gap: 8px; font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #b7acd9; margin-bottom: 10px; }
    .sys-row { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; font-size: 13px; border-top: 1px solid rgba(255,255,255,.07); }
    .sys-row > span:first-child { color: #b7acd9; }
    .st { display: inline-flex; align-items: center; gap: 8px; font-weight: 600; } .st.ok { color: #6ee7b7; } .st.err { color: #fca5a5; }
    .spinner { width: 12px; height: 12px; }
    .logos { display: flex; gap: 6px; } .logos img { width: 18px; height: 18px; object-fit: contain; background: #fff; border-radius: 5px; padding: 2px; }
    .retry { margin-top: 10px; width: 100%; height: 32px; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      border-radius: 8px; border: 1px solid rgba(255,255,255,.18); background: rgba(255,255,255,.08); color: #fff; font: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; }
    .retry:hover { background: rgba(255,255,255,.15); }
  `],
})
export class AuthSideComponent {
  readonly status = inject(StatusService);
  readonly host = API_HOST;
}
