import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OnedriveService {
  private apiUrl = 'https://graph.microsoft.com/v1.0/me/drive';
  private oneDriveAccessToken: string = '';   // Replace with the actual token
  totalSpace: number = 0;
  usedSpace: number = 0 ;
  remainingSpace : number = 0;
  driveId: number = 2;

  constructor(private http: HttpClient, private userService: UserService) {}

  ngOnInit(): void{
      this.driveId = 2;
      this.userService.getOnedriveAccessToken().subscribe({
        next: (token) => {
          this.oneDriveAccessToken = token;
          console.log('Google Access Token:', this.oneDriveAccessToken);
        },
        error: (err) => {
          console.error('Error fetching Google Access Token:', err);
        },
      });
  }

  getStorageDetails() {
    const headers = { Authorization: `Bearer ${this.oneDriveAccessToken}` };
    return this.http.get(this.apiUrl, { headers });
  }

  getOneDriveTotalSpace(): number {
    this.getStorageDetails().subscribe({
      next: (data: any) => { this.totalSpace = data.quota.total; },
      error: (err) => { console.log("Error : " + err.message); },
    });
    return this.totalSpace;
  }

  getOneDriveUsedSpace(): number {
    this.getStorageDetails().subscribe({
      next: (data: any) => { this.usedSpace = data.quota.used; },
      error: (err) => { console.log("Error : " + err.message); },
    });
    return this.usedSpace;
  }

  getOneDriveRemainingSpace(): number {
    this.getStorageDetails().subscribe({
      next: (data: any) => { this.remainingSpace = this.totalSpace - this.usedSpace; },
      error: (err) => { console.log("Error : " + err.message); },
    });
    return this.remainingSpace;
  }

}

