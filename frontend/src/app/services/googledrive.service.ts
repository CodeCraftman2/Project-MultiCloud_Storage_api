import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})

export class GoogledriveService {
  private apiUrl = 'https://www.googleapis.com/drive/v3/about';
  private googleAccessToken = '';   // Replace with the actual token
  totalSpace: number = 0;
  usedSpace: number = 0 ;
  remainingSpace : number = 0;
  driveId: number = 1;

  constructor(private http: HttpClient, private userService: UserService ) {}

  ngOnInit(){
    this.driveId = 1;
    this.userService.getGoogleAccessToken().subscribe({
      next: (token) => {
        this.googleAccessToken = token;
        console.log('Google Access Token:', this.googleAccessToken);
      },
      error: (err) => {
        console.error('Error fetching Google Access Token:', err);
      },
    });
  }

  getStorageDetails() {
    const headers = { Authorization: `Bearer ${this.googleAccessToken}` };
    return this.http.get(`${this.apiUrl}?fields=storageQuota`, { headers });
  }

  /** Storage quota in bytes for the given access token. */
  getQuota(accessToken: string): Observable<{ used: number; total: number }> {
    const headers = { Authorization: `Bearer ${accessToken}` };
    return this.http.get<any>(`${this.apiUrl}?fields=storageQuota`, { headers }).pipe(
      map((data) => ({ used: Number(data.storageQuota.usage), total: Number(data.storageQuota.limit) }))
    );
  }

  getGoogleDriveTotalSpace(): number {
    this.getStorageDetails().subscribe({
      next: (data: any) => { this.totalSpace = data.storageQuota.limit; },
      error: (err) => { console.log("Error : " + err.message); },
    });
    return this.totalSpace;
  }

  getGoogleDriveUsedSpace(): number {
    this.getStorageDetails().subscribe({
      next: (data: any) => { this.usedSpace = data.storageQuota.usage; },
      error: (err) => { console.log("Error : " + err.message); },
    });
    return this.usedSpace;
  }

  getGoogleDriveRemainingSpace(): number {
    this.getStorageDetails().subscribe({
      next: (data: any) => { this.remainingSpace = this.totalSpace - this.usedSpace; },
      error: (err) => { console.log("Error : " + err.message); },
    });
    return this.remainingSpace;
  }

}
