import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE } from './api.config';

export type DriveKey = 'google' | 'onedrive';

/** Row shape returned by the /api/files/{drive}/files endpoints. */
export interface DriveFile {
  storagePath: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private baseUrl = `${API_BASE}/api/files`;

  constructor(private http: HttpClient) {}

  list(drive: DriveKey, userId: number): Observable<DriveFile[]> {
    return this.http.get<DriveFile[]>(`${this.baseUrl}/${drive}/files`, { params: { userId } });
  }

  /** Upload with progress events (use `observe: 'events'` consumers). */
  uploadWithProgress(drive: DriveKey, file: File, userId: number): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId.toString());
    return this.http.post(`${this.baseUrl}/${drive}/upload`, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }

  delete(drive: DriveKey, storagePath: string, userId: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${drive}/delete/${encodeURIComponent(storagePath)}`, {
      params: { userId },
      responseType: 'text',
    });
  }

  download(drive: DriveKey, storagePath: string, userId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${drive}/download/${encodeURIComponent(storagePath)}`, {
      params: { userId },
      responseType: 'blob',
    });
  }

  // ---- Older per-drive helpers, kept for compatibility ----

  listGoogleFiles(userId: number): Observable<any> {
    return this.list('google', userId);
  }

  listOneDriveFiles(userId: number): Observable<any> {
    return this.list('onedrive', userId);
  }

  uploadGoogleFile(file: File, userId: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId.toString());
    return this.http.post(`${this.baseUrl}/google/upload`, formData);
  }

  uploadOneDriveFile(file: File, userId: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId.toString());
    return this.http.post(`${this.baseUrl}/onedrive/upload`, formData);
  }

  deleteGoogleFile(storagePath: string, userId: number): Observable<any> {
    return this.delete('google', storagePath, userId);
  }

  deleteOneDriveFile(storagePath: string, userId: number): Observable<any> {
    return this.delete('onedrive', storagePath, userId);
  }

  downloadGoogleFile(storagePath: string, userId: number): Observable<Blob> {
    return this.download('google', storagePath, userId);
  }

  downloadOneDriveFile(storagePath: string, userId: number): Observable<Blob> {
    return this.download('onedrive', storagePath, userId);
  }
}
