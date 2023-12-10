import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-username-recovery',
  templateUrl: './username-recovery.component.html',
  styleUrls: ['./username-recovery.component.css',
    '../../assets/Stylesheet/login.css']
})
export class UsernameRecoveryComponent implements OnInit {
  usernameRecoveryForm!: FormGroup;
  submitted = false;
  username: string = '';
  email: string = '';

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.usernameRecoveryForm = this.formBuilder.group({
      email: ['', Validators.required]
    });
  }

  onSubmit() {
    this.submitted = true;

    let bodyData = {
      email: this.usernameRecoveryForm.controls['email']!.value,
    }

    console.log(bodyData);

    this.usernameRecoveryForm.reset();
  }
}
