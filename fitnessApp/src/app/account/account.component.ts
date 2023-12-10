import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/user/user.service';

import { GetToken } from 'src/utilFunctionTokenService.service';
import { StorageService } from '../storage.service';
import { userModel } from 'src/user/userModel';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule,  } from '@angular/forms';
import { NavigationService } from 'src/services/navigation.service';
import { LoadingServiced } from 'src/loadingService.service';
import { delay } from 'rxjs';







@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css', '../../assets/Stylesheet/mainbox.css']
})
export class AccountComponent implements OnInit {

  constructor(private userService: UserService,
    private storageService: StorageService,
    private getToken: GetToken, public formBuilder: FormBuilder,
     private navigationService: NavigationService, public loadingService: LoadingServiced) {
 }

 userName: string;
 userId: string;
 accountForm!: FormGroup;



 ngOnInit(): void {
 
  const token = this.storageService.getTokenValue();
  this.userName = this.getToken.getUserNameFromToken(token) || '0';

  this.userId = this.getToken.getUserIdFromToken(token) || '0';

 

  this.accountForm = this.formBuilder.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    trainer: ['']
  });


  
}

goToAnotherPage(innerItem: string) {
  this.navigationService.selectInnerItem(innerItem);
}


// updateUserDetails(userId: string) {
//   this.userService.getUserById(userId).subscribe(currentUser => {
//     const updatedUserData: userModel = {
//       ...currentUser,
//       firstName: this.accountForm.value.firstName,
//       lastName: this.accountForm.value.lastName,
//       trainerCheck: this.accountForm.value.trainerCheck
//     };

//     this.userService.updateUser(userId, updatedUserData).subscribe({
//       next: (response: any) => {
//         console.log('User updated successfully', response);
//       },
//       error: (error: any) => {
//         console.error('Error updating user', error);
//       }
//     });
//   });
// }

onSubmit(){
  // if(this.accountForm.valid){
  //   const userId = this.updateUserDetails(this.userId);
  // }
  // console.log('Form Submitted', this.accountForm.value);
  this.loadingService.setLoading(true);
  
  setTimeout(() => {
    this.loadingService.setLoading(false);
    this.accountForm.reset();
  }, 500);
}



// updateUserDetails(userId: string) {
//   const updatedUserData: userModel = {
//     firstName: 'fn',   
//     lastName: 'ln',     
//     email: 'fn@ln.com', 
//     dateOfBirth: '2001-01-01',   
//     trainerCheck: 'no',         
//     username: 'user353',     
//     password: 'password',     
//     confirmPassword: 'password' 
//   };

  

  // this.userService.updateUser(userId, updatedUserData).subscribe({
  //   next: (response: any) => {
      
  //   },
  //   error: (error: any) => {
      
  //   }
  // });
}








