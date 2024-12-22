import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/multicloudstorageapi/oauth';

  constructor(private http: HttpClient) {}

  initiateGoogleOAuth(): void {
    window.location.href = `${this.baseUrl}/google`;
  }

  initiateOneDriveOAuth(): void {
    window.location.href = `${this.baseUrl}/onedrive`;
  }

}


