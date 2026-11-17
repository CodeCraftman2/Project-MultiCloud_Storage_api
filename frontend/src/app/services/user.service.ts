import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { API_BASE } from './api.config';

export interface UserFile {
  fileId: number;
  userId: number;
  driveId: number;
  folderId?: number;
  fileName: string;
  fileSize: number;
  fileType?: string;
  storagePath: string;
  createdAt: string;
}

export interface User {
  userId: number;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriveStatus {
  connected: boolean;
  email: string;
  accessToken: string;
}

export type UserLoadState = 'idle' | 'loading' | 'loaded' | 'error';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = `${API_BASE}/users`;
  googleEmail: string = 'Not Connected';
  oneDriveEmail: string = 'Not Connected';

  /** The logged-in user's profile, shared by the header, sidebar and pages. */
  readonly currentUser = signal<User | null>(null);
  readonly userState = signal<UserLoadState>('idle');
  readonly initials = computed(() => {
    const name = this.currentUser()?.username?.trim() ?? '';
    return name ? name.slice(0, 2).toUpperCase() : '?';
  });

  constructor(private http: HttpClient) {}

  register(user: Partial<User>): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, user);
  }

  update(userId: number, user: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/update/${userId}`, user);
  }

  getCurrentUser(userId: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/currentuser`, { params: { userId } });
  }

  /** Fetch the logged-in user into `currentUser` (no-op when nobody is logged in). */
  loadCurrentUser(): void {
    const userId = this.getUserId();
    if (!userId) return;
    this.userState.set('loading');
    this.getCurrentUser(userId).subscribe({
      next: (user) => {
        this.currentUser.set(user);
        this.userState.set(user ? 'loaded' : 'error');
      },
      error: () => this.userState.set('error'),
    });
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/all`);
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, { username, password }).pipe(
      tap((response) => {
        if (response?.isAuthenticated) {
          localStorage.setItem('userId', response.userId);
        }
      })
    );
  }

  isLoggedIn(): boolean {
    return !!this.getUserId();
  }

  getUserId(): number {
    return Number(localStorage.getItem('userId'));
  }

  clearUserData(): void {
    localStorage.removeItem('userId');
    this.currentUser.set(null);
    this.userState.set('idle');
  }

  getFilesByUserId(userId: number): Observable<UserFile[]> {
    return this.http.get<UserFile[]>(`${this.baseUrl}/myfiles`, {
      params: { userId },
    });
  }

  getTokensOfUser(userId: number, driveId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/tokens`, {
      params: { userId, driveId },
    });
  }

  getGoogleAccessToken(): Observable<string> {
    const userId = this.getUserId();
    return this.getTokensOfUser(userId, 1).pipe(map((data) => data.accesstoken));
  }

  getOnedriveAccessToken(): Observable<string> {
    const userId = this.getUserId();
    return this.getTokensOfUser(userId, 2).pipe(map((data) => data.accesstoken));
  }

  getGoogledriveEmail(): string {
    const userId = this.getUserId();
    this.getTokensOfUser(userId, 1).subscribe({
      next: (data) => (this.googleEmail = data.email),
      error: (err) => console.log('Error: ' + err.message),
    });
    return this.googleEmail;
  }

  getOnedriveEmail(): string {
    const userId = this.getUserId();
    this.getTokensOfUser(userId, 2).subscribe({
      next: (data) => (this.oneDriveEmail = data.email),
      error: (err) => console.log('Error: ' + err.message),
    });
    return this.oneDriveEmail;
  }

  /** Connection status of a drive (1 = Google Drive, 2 = OneDrive) for the logged-in user. */
  getDriveStatus(driveId: number): Observable<DriveStatus> {
    return this.getTokensOfUser(this.getUserId(), driveId).pipe(
      map((data) => ({
        connected: !!data.isExist,
        email: data.isExist ? data.email : 'Not Connected',
        accessToken: data.accesstoken ?? '',
      }))
    );
  }
}
