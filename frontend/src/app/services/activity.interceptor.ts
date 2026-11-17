import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize, tap } from 'rxjs/operators';
import { API_BASE } from './api.config';
import { SKIP_ACTIVITY, StatusService } from './status.service';

type Rule = [method: string, pattern: RegExp, label: string | ((req: HttpRequest<unknown>) => string)];

const driveName = (req: HttpRequest<unknown>) =>
  (req.params.get('driveId') ?? new URL(req.urlWithParams).searchParams.get('driveId')) === '2'
    ? 'OneDrive'
    : 'Google Drive';

const RULES: Rule[] = [
  ['POST', /\/users\/login$/, 'Signing in'],
  ['POST', /\/users\/register$/, 'Creating your account'],
  ['GET', /\/users\/currentuser/, 'Fetching user info'],
  ['PUT', /\/users\/update\//, 'Saving profile'],
  ['GET', /\/users\/myfiles/, 'Loading your files'],
  ['GET', /\/users\/tokens/, (r) => `Checking ${driveName(r)} connection`],
  ['GET', /\/api\/files\/google\/files/, 'Listing Google Drive files'],
  ['GET', /\/api\/files\/onedrive\/files/, 'Listing OneDrive files'],
  ['POST', /\/api\/files\/google\/upload/, 'Uploading to Google Drive'],
  ['POST', /\/api\/files\/onedrive\/upload/, 'Uploading to OneDrive'],
  ['DELETE', /\/api\/files\/google\/delete/, 'Deleting from Google Drive'],
  ['DELETE', /\/api\/files\/onedrive\/delete/, 'Deleting from OneDrive'],
  ['GET', /\/api\/files\/google\/download/, 'Downloading from Google Drive'],
  ['GET', /\/api\/files\/onedrive\/download/, 'Downloading from OneDrive'],
  ['GET', /googleapis\.com\/drive/, 'Reading Google Drive storage'],
  ['GET', /graph\.microsoft\.com/, 'Reading OneDrive storage'],
];

export function describeRequest(req: HttpRequest<unknown>): string {
  for (const [method, pattern, label] of RULES) {
    if (req.method === method && pattern.test(req.url)) {
      return typeof label === 'function' ? label(req) : label;
    }
  }
  const path = req.url.replace(API_BASE, '').split('?')[0];
  return `${req.method} ${path}`;
}

/** Records every HTTP call in the StatusService and keeps the backend health indicator current. */
export const activityInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_ACTIVITY)) return next(req);

  const status = inject(StatusService);
  const isBackend = req.url.startsWith(API_BASE);
  const id = status.begin(describeRequest(req));
  let settled = false;
  let ok = false;
  let code = 0;

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          settled = true;
          ok = true;
          code = event.status;
        }
      },
      error: (err: HttpErrorResponse) => {
        settled = true;
        code = err?.status ?? 0;
      },
    }),
    finalize(() => {
      status.end(id, ok, code);
      if (isBackend && settled) {
        code === 0 ? status.markOffline() : status.markOnline();
      }
    })
  );
};
