import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { calorieModel } from './calorieModel';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})

export class CalorieService {
  //Base URL + endpoint specification
  private endpoint = 'calorie';
  private domain: string | undefined;

  constructor(private http: HttpClient) 
  {
    this.domain = environment.domain;
  }


  
  // foodName: string 
  // calories: string
  // carbs: string
  // fats: string
  // proteins: string

  //Create 
  createCalorie(foodName:string, calories: string, carbs: string, fats: string, proteins: string, userID: string): Observable<calorieModel>
  {
    var enteredCalorie = new calorieModel(foodName,calories,carbs,fats,proteins,userID);
    return this.http.post<calorieModel>(this.domain + this.endpoint + '/create/', enteredCalorie);
  }

  //Read All (for individual user) 

  //Read All for user based on userID
  getCalorie(): Observable<calorieModel>
  {
    return this.http.get<calorieModel>(this.domain + this.endpoint + '/readUserID/');
  }

  getCalorieUserID(userID: string): Observable<calorieModel>
  {
    return this.http.get<calorieModel>(this.domain + this.endpoint + '/readUserID/' + userID);
  }

  //update 
  
  //delete 

}
