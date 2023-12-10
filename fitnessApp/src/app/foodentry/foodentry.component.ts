import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { MatTable } from '@angular/material/table';
import { HttpClient } from '@angular/common/http';
import { CalorieService } from 'src/calorie/calorie.service';
import { NavigationService } from 'src/services/navigation.service';

export interface FoodInfo {
  foodName: string,
  calories: string,
  carbs: string,
  fats: string,
  proteins: string,
}

@Component({
  selector: 'app-foodentry',
  templateUrl: './foodentry.component.html',
  styleUrls: ['./foodentry.component.css', '../../assets/Stylesheet/mainbox.css']
})
export class FoodentryComponent {
  @ViewChild(MatTable) table!: MatTable<any>;
  constructor(public formBuilder: FormBuilder, private http: HttpClient, private calorieService: CalorieService, private navigationService: NavigationService) { }

  goToAnotherPage(innerItem: string) {
    this.navigationService.selectInnerItem(innerItem);
  }

  formData: FoodInfo[] = [];
  dataSource = this.formData;

  columnDisplay: string[] = [
    'foodName',
    'calories',
    'carbs',
    'fats',
    'proteins'
  ];

  foodEntryForm = this.formBuilder.group({
    foodName: ['', Validators.required],
    calories: ['', Validators.required],
    carbs: ['', Validators.required],
    fats: ['', Validators.required],
    proteins: ['', Validators.required],
  })

  onSubmit() {

    let inputInfo =
    {
      "foodName": this.foodEntryForm.controls['foodName']!.value,
      "calories": this.foodEntryForm.controls['calories']!.value,
      "carbs": this.foodEntryForm.controls['carbs']!.value,
      "fats": this.foodEntryForm.controls['fats']!.value,
      "proteins": this.foodEntryForm.controls['proteins']!.value,
      "userID": '0'
    }

    //Create
    // this.http.post("http://localhost:9992/calorie/create", inputInfo).subscribe((resultData: any) =>
    // {
    //   console.log(resultData);
    //   alert("Calorie Log Successful")
    // });

    this.calorieService.createCalorie(inputInfo.foodName as string, inputInfo.calories as string, inputInfo.carbs as string, inputInfo.fats as string, inputInfo.proteins as string, inputInfo.userID as string).subscribe
      ({
        next: resultData => {
          console.log(resultData);
          alert("food item entered successfully");
        }
      });


    //Read
    // this.http.get("http://localhost:9992/calorie/read").subscribe((resultData: any) =>
    // {
    //   console.log(resultData.data);
    // });

    this.calorieService.getCalorie().subscribe({
      next: resultData => {
        console.log(resultData);
      }
    })

  }
}
