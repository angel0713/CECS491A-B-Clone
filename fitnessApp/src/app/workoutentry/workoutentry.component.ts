import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormControl, FormGroup } from '@angular/forms';
import { MatTable } from '@angular/material/table';
import { NavigationService } from 'src/services/navigation.service';

//for environment variables
import { WorkoutService } from 'src/workout/workout.service';

export interface WorkoutInfo {
  muscleGroup: string,
  exerciseName: string,
  sets: number,
  reps: number,
}

interface MuscleGroup {
  value: string;
  label: string;
}

//variable to use for accessing CRUD operation methods
var workoutList = WorkoutService;

@Component({
  selector: 'app-workoutentry',
  templateUrl: './workoutentry.component.html',
  styleUrls: ['./workoutentry.component.css', '../../assets/Stylesheet/mainbox.css']
})
export class WorkoutentryComponent implements OnInit {
  workoutEntryForm!: FormGroup;
  @ViewChild(MatTable) table!: MatTable<any>;
  constructor(public formBuilder: FormBuilder, private http: HttpClient, private workoutService: WorkoutService, private navigationService: NavigationService) { }

  goToAnotherPage(innerItem: string) {
    this.navigationService.selectInnerItem(innerItem);
  }

  exercisesList: any;
  muscleGroups: MuscleGroup[] = [
    { value: 'abdominals', label: 'Abdominals' },
    { value: 'abductors', label: 'Abductors' },
    { value: 'adductors', label: 'Adductors' },
    { value: 'biceps', label: 'Biceps' },
    { value: 'calves', label: 'Calves' },
    { value: 'chest', label: 'Chest' },
    { value: 'forearms', label: 'Forearms' },
    { value: 'glutes', label: 'Glutes' },
    { value: 'hamstrings', label: 'Hamstrings' },
    { value: 'lats', label: 'Lats' },
    { value: 'lower_back', label: 'Lower Back' },
    { value: 'middle_back', label: 'Middle Back' },
    { value: 'neck', label: 'Neck' },
    { value: 'quadriceps', label: 'Quadriceps' },
    { value: 'traps', label: 'Traps' },
    { value: 'triceps', label: 'Triceps' }
  ];
  muscleGroup: string;
  selectedExercise: string;
  formData: WorkoutInfo[] = [];
  dataSource = this.formData;
  workoutAmount: number = 3;

  //test stuff
  workoutArray: any[] = [];
  private domain: string | undefined
  columnDisplay: string[] = [
    'muscleGroup',
    'exerciseName',
    'sets',
    'reps'
  ];

  //Form initializers & make each section required
  ngOnInit() {
    this.workoutEntryForm = this.formBuilder.group({
      muscleGroup: ['', Validators.required],
      exercise: ['', Validators.required],
      sets: [0, Validators.required],
      reps: [0, Validators.required],
      otherExercise: [{ value: '', disabled: true }, Validators.required]
    });
    //get previously saved amount
    const savedWorkoutAmount = localStorage.getItem('workoutAmount');
    if (savedWorkoutAmount !== null) {
      this.workoutAmount = +savedWorkoutAmount;
    }
    // this.workoutService.filterWorkoutLists("None").subscribe(item => {
    //   this.muscleGroups = item;
    //   console.log(this.muscleGroups);
    // });
  }

  checkOtherInput() {
    const exerciseControl = this.selectedExercise;
    const otherExerciseControl = this.workoutEntryForm.get('otherExercise');
    if (exerciseControl && otherExerciseControl) {
      const isOtherSelected = exerciseControl === 'Other';
      if (isOtherSelected) {
        otherExerciseControl.enable();
      } else {
        otherExerciseControl.disable();
      }
    }
  }

  fetchWorkoutList() {
    if (this.muscleGroup) {
      // Check if recommendations are in localStorage
      const storedRecommendations = localStorage.getItem(`workoutRecommendations_${this.muscleGroup}`);
      if (storedRecommendations) {
        // If found in localStorage, use the stored data
        this.exercisesList = JSON.parse(storedRecommendations);
        if (this.exercisesList.length == 0) {
          localStorage.removeItem(`workoutRecommendations_${this.muscleGroup}`);
          this.fetchWorkoutList();
        }
      } else {
        this.workoutService.getWorkoutExercises(this.muscleGroup).subscribe((data: any) => {
          this.exercisesList = data;
          // Store recommendations in localStorage
          localStorage.setItem(`workoutRecommendations_${this.muscleGroup}`, JSON.stringify(this.exercisesList));
        });
      }
    }
  }

  //create function
  onSubmit() {

    let inputInfo =
    {
      "workoutOption": this.workoutEntryForm.controls['muscleGroup']!.value,
      "workoutType": this.selectedExercise === 'Other'
        ? this.workoutEntryForm.controls['otherExercise']!.value : this.selectedExercise,
      "sets": this.workoutEntryForm.controls['sets']!.value,
      "reps": this.workoutEntryForm.controls['reps']!.value,

      "userID": '0' // needs a helper function from users to retrieve user info based on given ID 
    }

    //old table stuff
    // this.dataSource.push(inputInfo)
    // this.table.renderRows();
    //http post
    //base url = domain
    //endpoint = 
    //append workout/create to the end
    //make a service with command CLI for the link generation
    //front-end would have a workout 

    //Returns an observable that is subscribed to; need to learn how to make error interceptor for both calorie and workout 
    this.workoutService.createWorkout((inputInfo.workoutOption as string), (inputInfo.workoutType as string), (inputInfo.sets as number), (inputInfo.reps as number), (inputInfo.userID as string)).subscribe
      ({
        next: resultData => {
          console.log(resultData);
          alert("Workout Log Registered Successfully")
        }
      });

    // this.http.post("http://localhost:9992/workout/create", inputInfo).subscribe((resultData: any) =>
    // {
    //   console.log(resultData);
    //   alert("workout log Registered Successfully")
    // });

    //read function // needs parameter to search

    //need to return of type model; not anymore since we will separate workouts from diets
    //here for testing
    this.workoutService.getWorkout(inputInfo.userID).subscribe({
      next: resultData => {
        // console.log(resultData);
      }
    });
    // this.http.get("http://localhost:9992/workout/read").subscribe((resultData: any) =>
    // {
    //   this.workoutArray = resultData.data;
    //   // for(let data of this.workoutArray)
    //   // {
    //   //   console.log(data);
    //   // }
    // });
    //save amount to storage
    this.workoutAmount++;
    localStorage.setItem('workoutAmount', this.workoutAmount.toString());


    this.workoutEntryForm.reset();
  }



}
