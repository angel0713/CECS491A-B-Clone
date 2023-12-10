import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { __values } from 'tslib';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css',
  '../../assets/Stylesheet/mainbox.css']
})
export class ContactUsComponent implements OnInit {
  contactForm!: FormGroup;
  submitted = false;
  name: string = '';
  email: string = '';
  message: string = '';

  constructor(public formBuilder:FormBuilder, private http: HttpClient){}

  ngOnInit() {
    this.contactForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
      message: ['', Validators.required],
    });
  }

  onSubmit() {
    
    let bodyData = {
    name: this.contactForm.controls['name']!.value,	
    email: this.contactForm.controls['email']!.value,
    message: this.contactForm.controls['message']!.value,
    }
  }
}


