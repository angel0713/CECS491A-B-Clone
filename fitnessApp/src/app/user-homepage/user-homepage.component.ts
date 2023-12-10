import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MentalWellnessTrackerComponent } from '../mental-wellness-tracker/mental-wellness-tracker.component';
import { WorkoutService } from 'src/workout/workout.service';
import { CalorieService } from 'src/calorie/calorie.service';
import { StorageService } from '../storage.service';
import { GetToken } from 'src/utilFunctionTokenService.service';
import { NavigationService } from 'src/services/navigation.service';


import Chart from 'chart.js/auto';

export interface inputInfo {
  username: string

}


@Component({
  selector: 'app-user-homepage',
  templateUrl: './user-homepage.component.html',
  styleUrls: ['./user-homepage.component.css']
})
export class UserHomepageComponent implements OnInit {
  workoutAmount: number = 0;
  mentalAmount: number = 0;
  trophyAmount: number = 0;

  showMentalHealth: boolean = true;


  constructor(private dialogRef: MatDialog, private workoutService: WorkoutService, private calorieService: CalorieService, private storageService: StorageService, private getToken: GetToken, private navigationService: NavigationService) { }

  goToAnotherPage(innerItem: string) {
    this.navigationService.selectInnerItem(innerItem);
  }

  openDialog() {
    this.dialogRef.open(MentalWellnessTrackerComponent);
  }

  selectedDate: Date;
  userID: string;
  userToken: string;
  workoutData: any[] = [];
  pastTenDaysWorkoutData: any[];
  calorieData: any[] = [];
  foodNameAndCalorieData: any[];
  dateFilteredCalorieData: any[];
  public workout_chart: any;
  public calorie_chart: any;

  showGraphToggle: boolean = false;


  ngOnInit(): void {

    this.selectedDate = new Date();

    const savedWorkoutAmount = localStorage.getItem('workoutAmount');
    if (savedWorkoutAmount !== null) {
      this.workoutAmount = +savedWorkoutAmount;
    }
    else {
      this.workoutAmount = 3;
    }
    // console.log(this.workoutAmount);
    //get the savedMentalAmount (how many times the user entered a mental journal in mental wellness tracker)
    const savedMentalAmount = localStorage.getItem('mentalAmount');
    if (savedMentalAmount !== null) {
      this.mentalAmount = +savedMentalAmount;
    }
    else {
      this.mentalAmount = 2;
    }

    //Get total trophy amount
    this.trophyAmount = this.mentalAmount + this.workoutAmount;

    this.showMentalHealth = localStorage.getItem('savedkCalToggle') === 'true';

    //kCalToggle will be set depending on the following comparisons, 
    //If the item obtained from storage is null then default to false (or true in the case of the other toggles)
    //If the item obtained from storage is not null then check if that item is equal to 'true', if it is then 
    //set the kCalToggle to true other wise set to false. 
    //same logic stands for the other toggles.

    this.showGraphToggle = localStorage.getItem('savedshowGraphToggle') !== null ?
      (localStorage.getItem('savedshowGraphToggle') === 'true') :
      true;

    // Create the chart if showGraphToggle is true or null
    if (this.showGraphToggle || this.showGraphToggle === null) {
      // If show chart, retrieve chart data from Mongo
      this.getUserIDFromToken();
      this.getWorkoutDataFromMongo();
      this.getCalorieDataFromMongo();
    }

  }

  ngAfterViewInit(): void {

  }

  getUserIDFromToken() {
    this.userToken = this.storageService.getTokenValue();
    this.userID = this.getToken.getUserIdFromToken(this.userToken) || '0';
  }

  getWorkoutDataFromMongo() {
    this.workoutService.getWorkoutUser(this.userID).subscribe(
      (data: any) => {
        this.extractAllWorkoutData(data);
        this.updateWorkoutDataVariables();
      },
      (error: any) => {
        console.error('Error', error);
      }
    );
  }

  getCalorieDataFromMongo() {
    this.calorieService.getCalorieUserID(this.userID).subscribe(
      (data: any) => {
        this.extractAllCalorieData(data);
        this.updateCalorieDataVariables();
      },
      (error: any) => {
        console.error('Error', error);
      }
    );
  }

  extractAllWorkoutData(data: any): void {
    if (Array.isArray(data.data)) {
      this.workoutData = data.data.map((item: any) => ({ ...item }));
    }
  }

  extractAllCalorieData(data: any): void {
    if (Array.isArray(data.data)) {
      this.calorieData = data.data.map((item: any) => ({ ...item }));
    }
  }

  dateToString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  filterItemsByDate(data: any[], targetDate: Date): any[] {
    const targetDatePart = this.dateToString(targetDate);

    return data.filter(item => {
      const itemDate = this.dateToString(new Date(item.createdAt));

      return itemDate === targetDatePart;
    });
  }

  getWorkoutDataForLast10Days() {
    const workoutDataForLast10Days: { date: string, totalSets: number }[] = [];

    for (let i = 0; i < 10; i++) {
      const currentDate = new Date(this.selectedDate);
      currentDate.setDate(currentDate.getDate() - i);

      const dateString = this.dateToString(currentDate);
      const filteredData = this.filterItemsByDate(this.workoutData, currentDate);
      const totalSets = this.calculateTotalSets(filteredData);

      workoutDataForLast10Days.push({ date: dateString, totalSets });
    }
    return workoutDataForLast10Days;
  }

  calculateTotalSets(data: any[]): number {
    return data.reduce((total, item) => total + item.sets, 0);
  }

  extractFoodAndCalorieData(data: any): { foodName: string, calories: number }[] {
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        foodName: item.foodName,
        calories: item.calories
      }));
    }
    return [];
  }

  updateWorkoutDataVariables() {
    this.pastTenDaysWorkoutData = this.getWorkoutDataForLast10Days();
    if (this.showGraphToggle || this.showGraphToggle === null) {
      this.createWorkoutChart();
    }
  }

  updateCalorieDataVariables() {
    this.dateFilteredCalorieData = this.filterItemsByDate(this.calorieData, this.selectedDate);
    this.foodNameAndCalorieData = this.extractFoodAndCalorieData(this.dateFilteredCalorieData);
    if (this.showGraphToggle || this.showGraphToggle === null) {
      this.createCalorieChart();
    }
  }

  chartColor = [
    '#00402a',
    '#005638',
    '#006c46',
    '#008040',
    '#00994d',
    '#00b359',
    '#00cc66',
    '#00e673',
    '#00ff80',
    '#1aff8c',
    '#33ff99',
    '#4dffad',
    '#66ffbf',
    '#80ffcc'
  ];

  tempCalorieLabel = ['Carbs', 'Fats', 'Protein', 'Other'];
  tempCalorieData = [67, 59, 103, 405];
  workoutChartDotColor = '#8bb49e';
  workoutChartLineColor = '#006c46';

  createWorkoutChart() {
    // Workout data
    const dateList: string[] = this.pastTenDaysWorkoutData.map((item: any) => item.date);
    const totalSets: number[] = this.pastTenDaysWorkoutData.map((item: any) => item.totalSets);
    // Workout Progress Line Chart
    this.workout_chart = new Chart("workoutChart", {
      type: 'line',
      data: {
        labels: dateList,
        datasets: [{
          fill: true,
          data: totalSets,
          label: 'Total exercise sets',
          backgroundColor: this.workoutChartDotColor,
          borderColor: this.workoutChartLineColor,
          pointHitRadius: 50,
          pointHoverRadius: 10,
        }]
      },
      options: {
        aspectRatio: 1.5,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          // title: {
          //   display: true,
          //   text: 'Workout Progress',
          //   font: {
          //     size: 24,
          //     family: 'Arial',
          //   }
          // }
        },
        layout: {
          padding: 24,
        },
        // Removing grid lines
        scales: {
          x: {
            display: false,
            // grid: { display: false }
          },
          y: {
            display: false,
            // grid: { display: false }
          }
        }
      }
    });
  }

  createCalorieChart() {
    // Calorie data source
    let foodNames: string[] = [];
    let calories: number[] = [];
    if (this.foodNameAndCalorieData && this.foodNameAndCalorieData.length !== 0) {
      foodNames = this.foodNameAndCalorieData.map((item: any) => item.foodName);
      calories = this.foodNameAndCalorieData.map((item: any) => item.calories);
    } else {
      foodNames.push('No calorie data');
      calories.push(1);
    }
    // Calorie Pie Chart
    this.calorie_chart = new Chart("CalorieChart", {
      type: 'pie',
      data: {
        // Values on X-Axis
        // Legends, an array of strings
        labels: foodNames,
        // Dataset values
        datasets: [{
          // Data value corresponding to the legends, an array of values
          data: calories,
          // Value color corresponding to the legneds, an array of strings
          // the strings could be color or rgb value like 'rgb(255, 99, 132)',
          // or hex color
          label: 'Calorie',
          backgroundColor: this.chartColor,
          hoverOffset: 24
        }],
      },
      options: {
        aspectRatio: 1,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          // title: {
          //   display: true,
          //   text: 'Calorie Tracker',
          //   font: {
          //     size: 24,
          //     family: 'Arial'
          //   }
          // }
          legend: {
            // Legend styling
            display: true,
            position: 'bottom',
            labels: {
              padding: 24
            }
          }
        },
        // Pie chart styling, removing borders
        elements: {
          arc: {
            borderWidth: 0
          }
        },
        // Pie chart styling, adding padding
        layout: {
          padding: 24
        },
      },
    });
  }
}
