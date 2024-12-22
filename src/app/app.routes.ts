import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { FilesComponent } from './files/files.component';
import { LoginComponent } from './login/login.component';
import { AboutComponent } from './about/about.component';
import { RegisterComponent } from './register/register.component';
import { DriveComponent } from './drive/drive.component';
import { GoogledriveComponent } from './googledrive/googledrive.component';
import { OnedriveComponent } from './onedrive/onedrive.component';

export const routes: Routes = [
    {path: '', redirectTo: 'multicloudstorageapi/login', pathMatch: 'full' },
    {path:'multicloudstorageapi/home',component:HomeComponent},
    {path:'multicloudstorageapi/profile',component:ProfileComponent},
    {path:'multicloudstorageapi/files',component:FilesComponent},
    {path:'multicloudstorageapi/about',component:AboutComponent},
    {path:'multicloudstorageapi/login',component:LoginComponent},
    {path:'multicloudstorageapi/register',component:RegisterComponent},
    {path:'multicloudstorageapi/home/drive',component:DriveComponent},
    {path:'multicloudstorageapi/home/googledrive',component:GoogledriveComponent},
    {path:'multicloudstorageapi/home/onedrive',component:OnedriveComponent}
];
