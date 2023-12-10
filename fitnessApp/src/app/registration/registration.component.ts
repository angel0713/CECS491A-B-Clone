import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { __values } from 'tslib';
import { ChatService } from 'src/services/chat.service';

import { UserService } from 'src/user/user.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css', '../../assets/Stylesheet/login.css']
})
export class RegistrationComponent implements OnInit {
  registrationForm!: FormGroup;
  firstName: string = "";
  lastName: string = "";
  email: string = "";
  dateOfBirth: string = "";
  trainerCheck: string = "";
  username: string = "";
  password: string = "";
  confirmPassword: string = "";

  regArray: any[] = [];

  constructor(private http: HttpClient, private formBuilder: FormBuilder, private chatService: ChatService, private userService: UserService, public router: Router) { };

  ngOnInit(): void {
    this.registrationForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      trainerCheck: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }

  // createUser() {
  //   this.chatService.createUser(this.username, this.username, '').subscribe(
  //     response => {
  //       console.log('User created successfully:', response);
  //       // Handle the response or perform any additional actions
  //     },
  //     error => {
  //       console.error('Error creating user:', error);
  //       // Handle the error or display an error message
  //     }
  //   );
  // }

  // formattedDate: string = ''; // Initialize to an empty string

  // onDateChange(event: any) {
  //   // Assuming event is a Date object or date string (e.g., "yyyy-MM-dd")
  //   if (event instanceof Date) {
  //     this.formattedDate = this.formatDate(event);
  //   } else {
  //     this.formattedDate = event;
  //   }
  // }

  // formatDate(date: Date): string {
  //   const year = date.getFullYear();
  //   const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Add 1 because months are zero-based
  //   const day = date.getDate().toString().padStart(2, '0');
  //   return `${year}-${month}-${day}`;
  // }

  register() {
    let bodyData =
    {
      "firstName": this.registrationForm.controls['firstName']!.value,
      "lastName": this.registrationForm.controls['lastName']!.value,
      "email": this.registrationForm.controls['email']!.value,
      "dateOfBirth": this.registrationForm.controls['dateOfBirth']!.value,
      "trainerCheck": this.registrationForm.controls['trainerCheck']!.value,
      "username": this.registrationForm.controls['username']!.value,
      "password": this.registrationForm.controls['password']!.value,
      "confirmPassword": this.registrationForm.controls['confirmPassword']!.value,

    };
    //Create Function

    this.userService.createUser(bodyData.firstName, bodyData.lastName, bodyData.email, bodyData.dateOfBirth, bodyData.trainerCheck, bodyData.username, bodyData.password, bodyData.confirmPassword).subscribe
    ({next: resultData =>
      {
        console.log(resultData);

        if(resultData){
        alert("User Registered Successfully");

        this.navigate()
        }else{
        alert("Registration failed.");


        }
      },
      
    });

    // this.http.post("http://localhost:9992/user/create", bodyData).subscribe((resultData: any) =>
    // {
    //   console.log(resultData);
    //   alert("User Registered Successfully")
    // });

    //Read Function

    this.userService.getUser().subscribe
    ({next: resultData =>
      {
        console.log(resultData);
      }
    });

    // this.http.get("http://localhost:9992/user/read").subscribe((resultData: any) =>
    // {
    //   this.regArray = resultData.data;
    //   for(let data of this.regArray)
    //   {
    //     console.log(data);
    //   }
    // });
  }

  navigate(){
    this.router.navigateByUrl('/input');

  }

}
