import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FileService } from '../services/file.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { OnedriveService } from '../services/onedrive.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-onedrive',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onedrive.component.html',
  styleUrl: './onedrive.component.css'
})
export class OnedriveComponent {

  drive = {id:1, name:"One Drive", src:"onedrive.png", email: "Not Connected", usedspace: 0, freespace: 0} ;

  files = [
  { "id": 1, "name": "file1", "size": 100000, "type": "text", "createdAt": "12-11-2024" },
  { "id": 2, "name": "file2", "size": 50454643, "type": "python", "createdAt": "12-11-2024" },
  { "id": 3, "name": "file3", "size": 200443, "type": "javascript", "createdAt": "12-11-2024" },
  { "id": 4, "name": "file4", "size": 300634, "type": "pdf", "createdAt": "12-11-2024" },
  { "id": 5, "name": "file5", "size": 754534534, "type": "image", "createdAt": "12-11-2024" }
   ]

  oneDriveFiles: any[] = [];
  userId = 1; // Replace with the actual user ID

  constructor(private fileService: FileService, private router: Router, private authService: AuthService,
    private userService: UserService, private oneDriveService: OnedriveService  ) {}

  connectOneDrive(): void {
    this.authService.initiateOneDriveOAuth();
  }

  ngOnInit(): void {
    this.fileService.listOneDriveFiles(this.userService.getUserId()).subscribe((files) => (this.oneDriveFiles = files));
    this.drive.email =  (this.userService.getGoogledriveEmail()).toString();
    this.drive.usedspace = this.oneDriveService.getOneDriveUsedSpace();
    this.drive.freespace = this.oneDriveService.getOneDriveRemainingSpace();
  }

  goBack():void{
    this.router.navigate(["multicloudstorageapi/home"]);
  }

  delete():void{
  
  }

}
