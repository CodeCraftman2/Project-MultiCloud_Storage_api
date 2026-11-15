import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { Router } from '@angular/router';
import { FileService } from '../services/file.service';
import { AuthService } from '../services/auth.service';
import { OnedriveService } from '../services/onedrive.service';
import { UserService } from '../services/user.service';
import { GoogledriveService } from '../services/googledrive.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule,],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

export class HomeComponent {

  isChecked = [false,false];
  selectedFile: File | null = null;
  userId : number = 0;
  googletotalSpace: number = 0;
  onedrivetotalSpace: number = 0;
  googleUsedSpace: number = 0;
  onedriveUsedSpace: number = 0;
  googleEmail: string = 'Not Connected';
  oneDriveEmail: string ='Not Connected';

  constructor(private router: Router, private fileService: FileService, private authService: AuthService, 
    private oneDriveService: OnedriveService, private googleDriveService: GoogledriveService, private userService: UserService){}

  drives = [
    { id:0, src:"googledrive.png",name:"Google Drive",email:this.googleEmail, storage:this.googleUsedSpace} ,
    { id:1, src:"onedrive.png", name:"One Drive",email:this.oneDriveEmail,storage:this.onedriveUsedSpace} 
  ]

  ngOnInit() {
    this.userId = this.userService.getUserId();
    this.googletotalSpace = this.googleDriveService.getGoogleDriveTotalSpace();
    this.googleUsedSpace = Number(((this.googleDriveService.getGoogleDriveUsedSpace() * this.googletotalSpace)/100 ).toFixed(1));
    this.onedrivetotalSpace = this.oneDriveService.getOneDriveTotalSpace();
    this.onedriveUsedSpace = Number(((this.oneDriveService.getOneDriveUsedSpace() * this.onedrivetotalSpace)/100 ).toFixed(1));
    this.googleEmail = (this.userService.getGoogledriveEmail()).toString();
    this.oneDriveEmail = (this.userService.getOnedriveEmail()).toString();
  }

  openDrive(driveIndex:number){

    if(driveIndex == 0){

      this.router.navigate(["multicloudstorageapi/home/googledrive"])
    }
    else{
      this.router.navigate(["multicloudstorageapi/home/onedrive"])
    }
  
  }

  openFileChooser(fileInput: HTMLInputElement) {
    fileInput.click(); // Opens the file chooser dialog
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];

    if(this.isChecked[0] && this.isChecked[1])
    {
      alert(this.selectedFile?.name + "Uploaded successfully.")
      this.uploadToGoogle();
      this.uploadToOneDrive();
      

    }
    else if (this.isChecked[0]==true && this.isChecked[1]==false )
    {
      alert(this.selectedFile?.name + "Uploaded successfully.")
      this.uploadToGoogle();
    }
    else if (this.isChecked[0]==false && this.isChecked[1]==true )
    {
      alert(this.selectedFile?.name + "Uploaded successfully.")
      this.uploadToOneDrive();
    }
    else{
      alert("You didn't choose any drive to upload the file.")
    }
  }

  uploadToGoogle(): void {
    if (this.selectedFile) {
      this.fileService.uploadGoogleFile(this.selectedFile, this.userId).subscribe({
        next: () => alert('File uploaded to Google Drive successfully!'),
        error: (err) => alert('Error uploading file to Google Drive: ' + err.message),
      });
    }
  }

  uploadToOneDrive(): void {
    if (this.selectedFile) {
      this.fileService.uploadOneDriveFile(this.selectedFile, this.userId).subscribe({
        next: () => alert('File uploaded to OneDrive successfully!'),
        error: (err) => alert('Error uploading file to OneDrive: ' + err.message),
      });
    }
  }

  connectGoogleDrive(): void {
    this.authService.initiateGoogleOAuth();
  }

  connectOneDrive(): void {
    this.authService.initiateOneDriveOAuth();
  }

}

function provideHttpClient(): readonly any[] | import("@angular/core").Type<any> {
  throw new Error('Function not implemented.');
}
