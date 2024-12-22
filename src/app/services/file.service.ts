import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private baseUrl = 'http://localhost:8080/multicloudstorageapi/api/files';

  constructor(private http: HttpClient) {}

  listGoogleFiles(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/google/files?userId=${userId}`);
  }

  listOneDriveFiles(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/onedrive/files?userId=${userId}`);
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
    return this.http.delete(`${this.baseUrl}/google/delete/${storagePath}?userId=${userId}`);
  }

  deleteOneDriveFile(storagePath: string, userId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/onedrive/delete/${storagePath}?userId=${userId}`);
  }

  downloadGoogleFile(storagePath: string, userId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/google/download/${storagePath}?userId=${userId}`, { responseType: 'blob' });
  }

  downloadOneDriveFile(storagePath: string, userId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/onedrive/download/${storagePath}?userId=${userId}`, { responseType: 'blob' });
  }
}
