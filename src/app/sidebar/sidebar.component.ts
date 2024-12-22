import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router} from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  boxes = [
    { id: 1, content: '  Home  ',src:"home_icon.png ",link:'multicloudstorageapi/home' },
    { id: 2, content: ' Profile',src:"profile_icon.png",link:'multicloudstorageapi/profile'},
    { id: 3, content: 'My Files',src:"files_icon.png",link:'multicloudstorageapi/files' },
    { id: 4, content: '  About ',src:"about_icon.png",link:'multicloudstorageapi/about' }
  ];

  activeBoxIndex: number = 0; // default index of the active box it mean's home page
  
  constructor(private router: Router) { }  // Inject Router

  // Method to handle clicks and identify the clicked element
  onBoxClick(index: number) {
    this.activeBoxIndex = index;
    this.router.navigate([this.boxes[index].link]);
    //this.router.navigate( [{ outlets: { mainfragment: [this.boxes[index].link] } }] ); 
  }
}
