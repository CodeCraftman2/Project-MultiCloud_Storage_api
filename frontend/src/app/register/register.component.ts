import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  
  confpwd: string = '';

  user = {
    username: '',
    passwordHash: '',
    email: '',
  };

  constructor(private userService: UserService, private router: Router) {}

  onSubmit(): void {
    if(this.user.username!==null && this.user.email!==null && this.user.passwordHash!==null && this.confpwd!==null &&
      this.user.username!=='' && this.user.email!=='' && this.user.passwordHash!=='' && this.confpwd!=='' ){
      if( this.user.passwordHash === this.confpwd ){
        this.userService.register(this.user).subscribe({
          next: (response) =>{
            if(response.isSuccess){
              alert(response.message + " Please Login to your Account.");
              this.router.navigate(['multicloudstorageapi/login']);
            }
            else{
              alert(response.message); 
            }
          },
          error: (err) => alert('Error registering user: ' + err.message),
        });
        
      }
    }
    else{
      alert('All fields must not be empty!!!');
    }
  }
}
