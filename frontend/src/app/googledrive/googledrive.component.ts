import { Component } from '@angular/core';
import { FileService } from '../services/file.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { GoogledriveService } from '../services/googledrive.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-googledrive',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './googledrive.component.html',
  styleUrl: './googledrive.component.css'
})
export class GoogledriveComponent {

  drive = { id:0, name:"Google Drive", src:"googledrive.png", email:"Not Connected", usedspace: 0, freespace: 0 };

  files = [
      { "id": 1, "name": "file1", "size": 10050450, "type": "pdf", "createdAt": "12-11-2024" },
      { "id": 2, "name": "file2", "size": 50454643, "type": "python", "createdAt": "12-11-2024" },
      { "id": 3, "name": "file3", "size": 200435443, "type": "javascript", "createdAt": "12-11-2024" },
      { "id": 4, "name": "file4", "size": 3003634, "type": "pdf", "createdAt": "12-11-2024" },
      { "id": 5, "name": "file5", "size": 754534534, "type": "video", "createdAt": "12-11-2024" }
   ]

  googleFiles: any[] = [];
  
  constructor(private fileService: FileService, private googleDriveService: GoogledriveService,
    private router: Router, private authService: AuthService , private userService: UserService) {}

  ngOnInit(): void {
    this.fileService.listGoogleFiles(this.userService.getUserId()).subscribe((files) => (this.googleFiles = files));
    this.drive.email = (this.userService.getGoogledriveEmail()).toString();
    this.drive.usedspace = this.googleDriveService.getGoogleDriveUsedSpace();
    this.drive.freespace = this.googleDriveService.getGoogleDriveRemainingSpace();
  }

  connectGoogleDrive(): void {
    this.authService.initiateGoogleOAuth();
  }

  goBack():void{
    this.router.navigate(["multicloudstorageapi/home"]);
  }

  delete():void{

  }

}
