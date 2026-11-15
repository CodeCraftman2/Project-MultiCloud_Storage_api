import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { errorContext } from 'rxjs/internal/util/errorContext';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  
  register(): void{
    this.router.navigate(['multicloudstorageapi/register']);
  }

  credentials = {
    username: '',
    password: '',
  };

  constructor(private router:Router, private userService: UserService ) {}

  onLogin(): void {
    this.userService.login(this.credentials.username, this.credentials.password).subscribe({
      next: (response: any) => {
        if ( response.isAuthenticated) {  
          localStorage.setItem('userId', response.userId); // Store userId and token (if available) in localStorage
          this.router.navigate(['multicloudstorageapi/home']);
        } 
        else {
          alert(response.message);
        }
      },
      error: (err: any) => {
        alert('Error : ' + err.message);
        console.log(err.message);
      },
    });
  }
  
  
}
