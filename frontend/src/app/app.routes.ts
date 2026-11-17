import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { FilesComponent } from './files/files.component';
import { AboutComponent } from './about/about.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DriveComponent } from './drive/drive.component';
import { GoogledriveComponent } from './googledrive/googledrive.component';
import { OnedriveComponent } from './onedrive/onedrive.component';
import { UserService } from './services/user.service';

/** Pages behind login: send anonymous visitors to the login page. */
const authGuard: CanActivateFn = () =>
  inject(UserService).isLoggedIn() ? true : inject(Router).parseUrl('/multicloudstorageapi/login');

/** Login / register: skip them when already logged in. */
const guestGuard: CanActivateFn = () =>
  inject(UserService).isLoggedIn() ? inject(Router).parseUrl('/multicloudstorageapi/home') : true;

export const routes: Routes = [
  { path: '', redirectTo: 'multicloudstorageapi/login', pathMatch: 'full' },
  { path: 'multicloudstorageapi/login', component: LoginComponent, canActivate: [guestGuard], title: 'Sign in · MultiCloud' },
  { path: 'multicloudstorageapi/register', component: RegisterComponent, canActivate: [guestGuard], title: 'Create account · MultiCloud' },
  { path: 'multicloudstorageapi/home', component: HomeComponent, canActivate: [authGuard], title: 'Dashboard · MultiCloud', data: { title: 'Dashboard' } },
  { path: 'multicloudstorageapi/profile', component: ProfileComponent, canActivate: [authGuard], title: 'Profile · MultiCloud', data: { title: 'Profile' } },
  { path: 'multicloudstorageapi/files', component: FilesComponent, canActivate: [authGuard], title: 'My Files · MultiCloud', data: { title: 'My Files' } },
  { path: 'multicloudstorageapi/about', component: AboutComponent, title: 'About · MultiCloud', data: { title: 'About' } },
  { path: 'multicloudstorageapi/home/drive', component: DriveComponent, canActivate: [authGuard], data: { title: 'Drive' } },
  { path: 'multicloudstorageapi/home/googledrive', component: GoogledriveComponent, canActivate: [authGuard], title: 'Google Drive · MultiCloud', data: { title: 'Google Drive', parent: 'Dashboard' } },
  { path: 'multicloudstorageapi/home/onedrive', component: OnedriveComponent, canActivate: [authGuard], title: 'OneDrive · MultiCloud', data: { title: 'OneDrive', parent: 'Dashboard' } },
  { path: '**', redirectTo: 'multicloudstorageapi/login' },
];
