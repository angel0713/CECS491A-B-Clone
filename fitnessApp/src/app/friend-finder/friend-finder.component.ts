import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/user/user.service';

@Component({
  selector: 'app-friend-finder',
  templateUrl: './friend-finder.component.html',
  styleUrls: ['./friend-finder.component.css', '../../assets/Stylesheet/mainbox.css']
})
export class FriendFinderComponent {
  searchEntry: string = '';

  usersArray: any[] = [];
  usernames: string[] = ['Max', 'Max2', 'Max3', 'Max4'];
  tempFriendRequests = ['Kenry', 'Kevin']

  constructor(private userService: UserService) {
    this.getAllUser();
  }

  ngOnInit(): void {

   }

  getAllUser() {
    this.userService.getAllUser().subscribe((resultData: any) => {
      console.log(resultData);

      this.usersArray = resultData.data;
    });
  }

  searchUser() {

  }

  checkUser() {
    console.log("Clicked on user");
  }
}
