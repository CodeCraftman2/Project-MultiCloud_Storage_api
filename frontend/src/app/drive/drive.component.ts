import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FileService } from '../services/file.service';

@Component({
  selector: 'app-drive',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './drive.component.html',
  styleUrl: './drive.component.css'
})
export class DriveComponent {

  drive = [{id:0, name:"Google Drive", src:"googledrive.png", email:"testuser1@gmail.com", storage:58},
           {id:1, name:"One Drive", src:"onedrive.png", email:"testuser1@outlook.com", storage:72} ];
  files = [
            {id:1, name:"file1", size:100, type:"java",createdAt:'20-10-2024'},
            {id:2, name:"file2", size:50, type:"python",createdAt:'12-11-2024'}
          ]
  goBack():void{
    this.router.navigate(["multicloudstorageapi/home"]);
  }
  delete():void{
    
  }

  googleFiles: any[] = [];
  oneDriveFiles: any[] = [];
  userId = 1; // Replace with the actual user ID

  constructor(private fileService: FileService, private router: Router) {}

  ngOnInit(): void {
    this.fileService.listGoogleFiles(this.userId).subscribe((files) => (this.googleFiles = files));
    this.fileService.listOneDriveFiles(this.userId).subscribe((files) => (this.oneDriveFiles = files));
  }
  
}
