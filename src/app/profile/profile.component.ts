import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { FormBuilder,FormGroup,FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit{

  isPasswordVisible: boolean = false;
  userForm: FormGroup;
  userId: number = 0; 

  constructor(private fb: FormBuilder, private http: HttpClient, private userService: UserService) {
    this.userForm = this.fb.group({
      id: this.userService.getUserId(),
      username: [''],
      email: [''],
      passwordHash: [''],
    });
  }

  ngOnInit():void{
    this.userId = this.userService.getUserId();
    this.getCurrentUserDetails();
  }

  getCurrentUserDetails():void{
    this.userService.getCurrentUser(this.userService.getUserId()).subscribe(
      (user: any) => this.userForm.patchValue(user));
  }

  updateUserDetails(): void {
    console.log('Form submitted', this.userForm.value);
    if(this.userForm.valid){
      this.userService.update(this.userId ,this.userForm.value).subscribe({
        next: (response) => {
          if(response.isUpdated){
            alert('User details updated successfully!')
          }
          else{
            alert("Retry with different details.");
          }
        },
        error: (err) =>{ alert('Failed to update user details.' + err.message);
          console.log(err);
        },
      });  
    }
    console.log('Form submitted', this.userForm.value); 
  }

  toggleVisibility(){
    this.isPasswordVisible = ! this.isPasswordVisible;
  }

}
