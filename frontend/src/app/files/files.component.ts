import { CommonModule, formatDate } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserFile, UserService } from '../services/user.service';

@Component({
  selector: 'app-files',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './files.component.html',
  styleUrl: './files.component.css'
})
export class FilesComponent {

  searchString:string='';
  files: UserFile[] = [];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    const userId = this.userService.getUserId();   // user ID from localstorage
    this.userService.getFilesByUserId(userId).subscribe({
      next: (data) => {
        this.files = data;
      },
      error: (err) => {
        console.error('Error fetching files:', err.message);
      },
    });
  }

   search(searchString:string){

   }

   delete(fileId: number):void{
    
   }



}
