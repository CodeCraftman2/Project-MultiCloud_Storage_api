import { Component, inject } from '@angular/core';
import { IconComponent, IconName } from '../shared/icon.component';
import { ToastKind, ToastService } from '../services/toast.service';

const ICON: Record<ToastKind, IconName> = { success: 'check', error: 'alert', info: 'info', warning: 'alert' };

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="stack" aria-live="polite">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast {{ t.kind }}" role="status">
          <span class="ico"><app-icon [name]="icon[t.kind]" [size]="16" [stroke]="2.4" /></span>
          <div class="grow">
            <div class="title">{{ t.title }}</div>
            @if (t.message) { <div class="msg">{{ t.message }}</div> }
          </div>
          <button class="close" (click)="toast.dismiss(t.id)" aria-label="Dismiss"><app-icon name="x" [size]="14" /></button>
        </div>
      }
    </div>
  `,
  styles: [`
    .stack { position: fixed; top: 16px; right: 16px; z-index: 100; display: flex; flex-direction: column; gap: 10px; width: min(380px, calc(100vw - 32px)); }
    .toast { display: flex; gap: 12px; align-items: flex-start; padding: 12px 12px 12px 14px; background: var(--surface);
      border: 1px solid var(--border); border-left: 4px solid var(--info); border-radius: 12px; box-shadow: var(--shadow-lg);
      animation: slide .22s cubic-bezier(.2,.8,.2,1) both; }
    .toast.success { border-left-color: var(--ok); } .toast.error { border-left-color: var(--err); } .toast.warning { border-left-color: var(--warn); }
    .ico { width: 28px; height: 28px; border-radius: 8px; display: grid; place-items: center; flex: none; background: var(--info-bg); color: var(--info); }
    .success .ico { background: var(--ok-bg); color: var(--ok); } .error .ico { background: var(--err-bg); color: var(--err); } .warning .ico { background: var(--warn-bg); color: var(--warn); }
    .title { font-weight: 700; font-size: 13.5px; } .msg { color: var(--text-2); font-size: 12.5px; margin-top: 2px; word-break: break-word; }
    .close { border: none; background: none; color: var(--text-3); cursor: pointer; padding: 4px; border-radius: 6px; display: grid; }
    .close:hover { background: #f1f0f5; color: var(--text); }
    @keyframes slide { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: none; } }
  `],
})
export class ToastsComponent {
  readonly toast = inject(ToastService);
  readonly icon = ICON;
}
