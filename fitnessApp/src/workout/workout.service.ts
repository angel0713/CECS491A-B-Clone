import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { workoutModel } from './workoutModel';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { HttpHeaders } from '@angular/common/http';
//need model to eventually sort by user ID
//const workoutModel = require('./workoutModel');
// const workoutList = workoutModel();

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  //workout model variable

  //http client variables to help with setting up the uri

  //specifies at what point in the website someone is in
  private endpoint = 'workout';
  //domain: to hide base url (localhost in this case)
  private domain: string | undefined;
  //domain + token for API requests
  private domainAPI: string | undefined;
  private apiToken: string;



  constructor(private http: HttpClient) {
    this.domain = environment.domain;
    this.domainAPI = environment.domainAPI;
    this.apiToken = environment.apiToken;
  }

  //Headers for Exercise Recommendation API 
  private HttpHeaders: HttpHeaders = new HttpHeaders;

  //utilizes id to identify user (could read from the token)


  //Create Function (takes in values as parameters)
  createWorkout(workoutOption: string, workoutType: string, sets: number, reps: number, userID: string): Observable<workoutModel> {
    //workout data to be entered
    var enteredWorkout = new workoutModel(workoutOption, workoutType, sets, reps, userID);
    return this.http.post<workoutModel>(this.domain + this.endpoint + '/create', enteredWorkout);

    //original stuff
    // this.http.post(this.domain + this.endpoint + '/create/', enteredWorkout).subscribe((resultData: any) => //need to replace this with a variable then use environment variable to modify it
    // {
    //   console.log(resultData);
    //   alert("workout log Registered Successfully")
    // });
  }

  //Read Function (need to rework this to get workouts of a specific person) 

  // Modify this one
  getWorkout(userID: string): Observable<workoutModel> {
    return this.http.get<workoutModel>(this.domain + this.endpoint + '/read/' + userID);

    

    //original stuff
    // this.http.get(this.domain + this.endpoint + '/read/').subscribe((resultData: any) =>
    // {
    //   console.log('runs');
    //   return this.http.get("http://localhost:9992/workout/read"); //need to replace this with a variable then use the environment variable to modify it
    // });
  }

  //gets workouts done by a user
  // getWorkoutUser(userID: string): Observable<workoutModel> {
  //   return this.http.get<workoutModel>(this.domain + this.endpoint + '/readWorkoutLog/' + userID);
  // }

// In WorkoutService
getWorkoutUser(userID: string): Observable<workoutModel> {
  return this.http.get<workoutModel>(this.domain + this.endpoint + '/readWorkoutLog/' + userID);
}


  //Update Function by user ID (need to test but should work based on filter workout function)
  updateWorkout(userID: string, newWorkout: workoutModel): Observable<workoutModel> {
    return this.http.patch<workoutModel>(this.domain + this.endpoint + '/update' + userID, newWorkout);
  }

  //delete function by user ID (need to test but should work based on filter workout function)
  deleteWorkout(userID: string): Observable<workoutModel> {
    return this.http.delete<workoutModel>(this.domain + this.endpoint + '/delete' + userID);
  }

  //Filters disability by document
  /* NOTES
  - retrieves a list of predetermined documents that contain the all the usable muscle groups for the user
    -use disability documents to limit strings to use for each: 
    -include NONE document to include someone who is healthy
    -should work and return arrays for each muscle group noted in workout Service js file
    -frontend needs to make function for managing / filling each array to save as a variable to use
    -should not return a list; only ONE document with the list of muscles usable
  */

  //essentially done; need to add muscle groups
  filterWorkoutLists(disability: string): Observable<workoutModel> {
    return this.http.get<workoutModel>(this.domain + this.endpoint + '/disabilityRead/:' + disability);
  }

  /*Calls API using muscle from API Ninjas
  -returned in JSON format i think
  -shouldn't really be involved in workout-entry but in detailed workout information since its for recommending exercises rather than choosing the exercise
  -API is not useful for limiting the exercise a user does and we don't know if an exercise is not listed in the API (go figure)
  -Main focus: Gives a list of random exercises to recommend, could add a refresh/recommendation button based on the least worked on muscles in the list
  */


  /* Source Code from API Ninjas

  const request = require('request');
  var muscle = 'biceps';
  request.get({
    url: 'https://api.api-ninjas.com/v1/exercises?muscle=' + muscle,
    headers: {
      'X-Api-Key': 'YOUR_API_KEY'
    },
}, function(error, response, body) {
  if(error) return console.error('Request failed:', error);
  else if(response.statusCode != 200) return console.error('Error:', response.statusCode, body.toString('utf8'));
  else console.log(body)
});

  */

  //this is done
  getWorkoutExercises(muscle: string, offset?: number) {
    var apiUrl = `${this.domainAPI}${muscle}`;
    if (offset !== undefined) {
      apiUrl += `&offset=${offset}`;
    }
    return this.http.get(apiUrl, { headers: new HttpHeaders({ 'X-Api-Key': this.apiToken }) });
  }
}

