import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';
import { CalorieService } from 'src/calorie/calorie.service';
import { StorageService } from '../storage.service';
import { GetToken } from 'src/utilFunctionTokenService.service';
import { MatTableDataSource } from '@angular/material/table';
import { NavigationService } from 'src/services/navigation.service';

@Component({
  selector: 'app-calorie-information',
  templateUrl: './calorie-information.component.html',
  styleUrls: ['./calorie-information.component.css', '../../assets/Stylesheet/mainbox.css']
})
export class CalorieInformationComponent implements OnInit {
  // Navigation service
  goToAnotherPage(innerItem: string) {
    this.navigationService.selectInnerItem(innerItem);
  }

  constructor(private calorieService: CalorieService, private storageService: StorageService, private getToken: GetToken, private navigationService: NavigationService) { };
  userID: string;
  userToken: string;
  calorieData: any[] = [];
  foodNameAndCalorieData: any[];
  dateFilteredCalorieData: any[];
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  displayedColumns: string[] = ['foodName', 'carbs', 'fats', 'proteins', 'calories', 'createdAt'];
  public calorie_info_chart: any;
  showGraphToggle: boolean = false;
  selectedDate: Date;
  selectedDateString: string;

  ngOnInit(): void {
    // Chart toggle
    this.showGraphToggle = localStorage.getItem('savedshowGraphToggle') !== null ?
      (localStorage.getItem('savedshowGraphToggle') === 'true') : true;
    // Date picker 
    this.selectedDate = new Date();
    this.selectedDateString = this.selectedDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    // Get Data from Mongo
    this.getUserIDFromToken();
    this.getCalorieDataFromMongo();
  }

  ngAfterViewInit(): void {

  }

  createOrUpdateChart(action: string) {
    if (this.showGraphToggle || this.showGraphToggle === null) {
      if (action == 'create') {
        this.createChart();
      } else {
        this.updateChart();
      }
    }
  }

  onDateChange(event: any) {
    // Call API to retrieve new data
    this.selectedDateString = this.selectedDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    this.updateCalorieDataVariables();
    this.createOrUpdateChart('update');
  }

  getUserIDFromToken() {
    this.userToken = this.storageService.getTokenValue();
    this.userID = this.getToken.getUserIdFromToken(this.userToken) || '0';
  }

  getCalorieDataFromMongo() {
    this.calorieService.getCalorieUserID(this.userID).subscribe(
      (data: any) => {
        this.extractAllCalorieData(data);
        this.updateCalorieDataVariables();
        this.createOrUpdateChart('create')
      },
      (error: any) => {
        console.error('Error', error);
      }
    );
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

  extractFoodAndCalorieData(data: any): { foodName: string, calories: number }[] {
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        foodName: item.foodName,
        calories: item.calories
      }));
    }
    return [];
  }

  updateCalorieDataVariables() {
    this.dateFilteredCalorieData = this.filterItemsByDate(this.calorieData, this.selectedDate);
    this.dataSource.data = this.dateFilteredCalorieData;
    this.foodNameAndCalorieData = this.extractFoodAndCalorieData(this.dateFilteredCalorieData);
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

  workoutChartDotColor = '#8bb49e';
  workoutChartLineColor = '#006c46';

  updateChart() {
    // Put new data here
    let foodNames: string[] = [];
    let calories: number[] = [];
    foodNames = this.foodNameAndCalorieData.map((item: any) => item.foodName);
    calories = this.foodNameAndCalorieData.map((item: any) => item.calories);
    if (foodNames.length == 0) {
      foodNames.push('No calorie data');
      calories.push(1);
    }
    this.calorie_info_chart.data.labels = foodNames;
    this.calorie_info_chart.data.datasets[0].data = calories;
    this.calorie_info_chart.update();
  }

  createChart() {
    // Calorie data source
    let foodNames: string[] = [];
    let calories: number[] = [];
    if (this.foodNameAndCalorieData) {
      foodNames = this.foodNameAndCalorieData.map((item: any) => item.foodName);
      calories = this.foodNameAndCalorieData.map((item: any) => item.calories);
    } else {
      foodNames.push('No calorie data');
      calories.push(1);
    }
    // Workout Progress Line Chart
    this.calorie_info_chart = new Chart("calorieInfoChart", {
      type: 'pie',
      data: {
        labels: foodNames,
        datasets: [{
          data: calories,
          label: 'Calorie',
          backgroundColor: this.chartColor,
          hoverOffset: 24,
        }]
      },
      options: {
        aspectRatio: 1,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          // title: {
          //   display: true,
          //   text: this.selectedDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          //   font: {
          //     size: 24,
          //     family: 'Arial',
          //   }
          // },
          legend: {
            // Legend styling
            display: false,
            position: 'bottom',
            labels: {
              padding: 24
            }
          },
        },
        // Pie chart styling, removing borders
        elements: {
          arc: {
            borderWidth: 0
          }
        },
        layout: {
          padding: 24,
        },
      }
    });
  }
}
