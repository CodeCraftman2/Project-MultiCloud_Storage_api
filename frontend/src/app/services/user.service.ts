import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = 'http://localhost:8080/multicloudstorageapi/users';
  googleEmail: string = 'Not Connected';

  constructor(private http: HttpClient) {}

  register(user: Partial<User>): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, user);
  }

  update(userId: number, user: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/update/${userId}`,  user );
  }

  getCurrentUser(userId: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/currentuser`, { params: { userId }});
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/all`);
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, { username, password });
  }

  getUserId(): number {
    return Number(localStorage.getItem('userId'));
  }

  clearUserData(): void {
    localStorage.removeItem('userId');
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
    return this.getTokensOfUser(userId, 1).pipe(
      map((data) => data.accessToken)
    );
  }

  getOnedriveAccessToken(): Observable<string> {
    const userId = this.getUserId();
    return this.getTokensOfUser(userId, 2).pipe(
      map((data) => data.accessToken)
    );
  }

  getGoogledriveEmail(): string {
    const userId = this.getUserId();
    this.getTokensOfUser(userId, 1).subscribe({
      next: (data) => this.googleEmail = data.email ,
      error: (err) => console.log("Error: " + err.message)
    });
    return this.googleEmail;
  }

  getOnedriveEmail(): string {
    const userId = this.getUserId();
    this.getTokensOfUser(userId, 2).subscribe({
      next: (data) => this.googleEmail = data.email ,
      error: (err) => console.log("Error: " + err.message)
    });
    return this.googleEmail;
  }

  /* 
  deleteMyFile(fileId: number, userId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/myfiles/delete`, {
      params: { fileId, userId },
    });
  }
  */
}
