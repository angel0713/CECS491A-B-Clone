import { Component, AfterViewInit, OnInit, OnDestroy, HostListener, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { Router, RouterModule, ActivatedRoute, NavigationExtras } from '@angular/router';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Location } from '@angular/common';
import { ChatService } from 'src/services/chat.service';
import { last } from 'rxjs';
import { StorageService } from '../storage.service';
import { GetToken } from 'src/utilFunctionTokenService.service';
import { LoadingServiced } from 'src/loadingService.service';
import { NavigationService } from 'src/services/navigation.service';
import { Subscription } from 'rxjs';

interface MenuItem {
  id: string,
  label: string,
  icon?: string,
  description?: string;
  component?: any;
  parent_id?: string;
  default_child?: string;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, AfterViewInit {

  screenWidth!: number;
  selectedOuterItem: string = '';
  selectedInnerItem: string = '';
  activeTabIndex: number = 0;
  currentComponentTitle: string = '';

  backStack: string[] = [];
  frontStack: string[] = [];
  backStackIdx: number = 0;

  private subscription: Subscription;

  constructor(private router: Router, private location: Location, private chatService: ChatService,
    private storageService: StorageService, private getToken: GetToken,
    public loadingService: LoadingServiced, private navigationService: NavigationService) { }

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;
    //add an event listener, listen to when the user clicks the backbutton with 'popstate',
    window.addEventListener('popstate', this.popList.bind(this));
    const getSavedOuterItem = localStorage.getItem('savedOuterItem');
    const getSavedInnerItem = localStorage.getItem('savedInnerItem');
    const getSavedbackStack = localStorage.getItem('savedbackStack');
    const getSavedfrontStack = localStorage.getItem('savedfrontStack');
    const getSavedbackStackIdx = Number(localStorage.getItem('savedbackStackIdx'));
    if (getSavedbackStack && getSavedbackStackIdx && getSavedOuterItem && getSavedInnerItem && getSavedfrontStack) {
      this.selectedOuterItem = getSavedOuterItem;
      this.selectedInnerItem = getSavedInnerItem;
      this.backStack = JSON.parse(getSavedbackStack);
      this.backStackIdx = getSavedbackStackIdx;
      this.frontStack = JSON.parse(getSavedfrontStack);
      this.location.go(`navbar/${this.selectedInnerItem}`);
    } else {
      this.selectedOuterItem = 'home';
      this.selectedInnerItem = 'homepage';
      this.backStack = ['homepage'];
      this.frontStack = [];
      this.backStackIdx = 0;
    }
    this.currentComponentTitle = this.findInnerItem(this.selectedInnerItem).label;
    this.router.navigate(['/navbar', `${this.selectedInnerItem}`]);
    if (this.selectedOuterItem) {
      this.connectChatService();
    }
    this.saveVariables();
    this.attachClearVariablesToWindow();
    // Find the index of the selectedInnerItem in the bottom nav items
    const selectedIndex = this.getBottomNavItems().findIndex(item => item.id === this.selectedOuterItem);
    // Set the initial value of activeTabIndex
    this.activeTabIndex = selectedIndex >= 0 ? selectedIndex : 0;

    this.subscription = this.navigationService.selectInnerItem$.subscribe((innerItem: string) => {
      if (innerItem == 'LOGOUTUSER') { // If the user navigate to login page through Log out page
        // Clear variables and go to login page
        this.clearVariables();
        this.router.navigate(['userlogin']);
      } else
        this.selectInnerItem(innerItem);
    });
  }


  ngAfterViewInit() {

  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  saveVariables() {
    localStorage.setItem('savedOuterItem', this.selectedOuterItem);
    localStorage.setItem('savedInnerItem', this.selectedInnerItem);
    localStorage.setItem('savedbackStack', JSON.stringify(this.backStack));
    localStorage.setItem('savedfrontStack', JSON.stringify(this.frontStack));

    localStorage.setItem('savedbackStackIdx', this.backStackIdx.toString());
    console.log("Saved variables");
  }

  clearVariables(): void {
    localStorage.removeItem('savedOuterItem');
    localStorage.removeItem('savedInnerItem');
    localStorage.removeItem('savedbackStack');
    localStorage.removeItem('savedbackStackIdx');
    localStorage.removeItem('savedfrontStack');
    console.log("Cleared variables");
  }
  attachClearVariablesToWindow(): void {
    (window as any).clearVariables = this.clearVariables.bind(this);
  }


  debugInfo() {
    console.log(this.selectedOuterItem);
    console.log(this.selectedInnerItem);
    console.log(this.backStack);
    console.log(this.backStackIdx);
  }

  // popList(event: PopStateEvent) {
  //   //if stack is not empty...
  //   if (this.backStack.length > 1 && this.backStackIdx > 0) {
  //     // Decrement the back stack index by 1
  //     this.backStackIdx -= 1;
  //     // Find last item by using the deremented back stack index
  //     const lastItem = this.backStack[this.backStackIdx];
  //     // Find item from the item set
  //     const newItem = this.findInnerItem(lastItem);
  //     // Change outer item and inner item
  //     if (newItem.parent_id) {
  //       this.selectedOuterItem = newItem.parent_id;
  //     }
  //     this.selectedInnerItem = newItem.id;
  //     console.log("Going back to item " + this.selectedInnerItem);

  //     // Make the url uniform to the selectedItem name (doesn't actually change the component, just changes look of url)
  //     // this.location.go(`navbar/${this.selectedInnerItem}`);

  //     // Use router outlet to display different component
  //     this.router.navigate(['/navbar', `${this.selectedInnerItem}`]);
  //     this.saveVariables();
  //   } else { // Else if the index is at the head of the back stack, then remain on current selected inner item
  //     // this.location.go(`navbar/${this.selectedInnerItem}`);
  //     this.router.navigate(['/navbar', `${this.selectedInnerItem}`]);
  //   }
  // }


  popList(event: PopStateEvent) {


    //Get the last segment in the url (this is the id of the component)
    //We need it to get the blue square to get on the proper part depending on the selected component
    const url = window.location.href;
    const segments = url.split('/');
    const lastSegment = segments.pop() || segments.pop();



    // console.log(lastSegment);
    //Create an object based on the lastSegment (this object will contain all of the information we need i.e. parent_id and id)
    const findItem = this.innerNavItems.find(item => item.id === lastSegment);

    // console.log("Here is findItem", findItem);
    //Finally we check if findItem is true
    if (findItem) {
      //And we obtain the parent_id from the findItem object (we put a '!' after the parent_id because typescript was giving problems because it was 
      //possible to get an undefined parent_id)
      const parentId = findItem.parent_id!;
      //Then set the selectedOuterItem to the parentId (i.e. 'workout', 'setting', etc.)

      this.selectedOuterItem = parentId;
      // console.log("HERE IS PARENTID", parentId);
      //Use same logic for the selectedInner Item
      const id = findItem.id!;
      this.selectedInnerItem = findItem.id;
    } else {
    }




    // if (newState === `navbar/${this.backStack[this.backStack.length - 1]}`) {
    // this.backStackIdx -= 1;

    // this.selectedOuterItem = 'setting';
    // this.selectedInnerItem = this.innerNavItems.find(item=>item.id===this.selectedInnerItem)!.id as string;


    // Decrement the back stack index by 1
    this.backStackIdx -= 1;
    // this.backStack.pop();



    // this.selectInnerItem = lastSegment;


    // this.selectedOuterItem = this.innerNavItems.find(item => item.id === this.selectedInnerItem)!.parent_id as string;
    // Find last item by using the deremented back stack index
    // const lastItem = this.backStack[this.backStackIdx];
    // // this.backStack.pop();
    // // Find item from the item set
    // const newItem = this.findInnerItem(lastItem);
    // // Change outer item and inner item

    // this.selectedInnerItem = newItem.id;

    // // Make the url uniform to the selectedItem name (doesn't actually change the component, just changes look of url)
    // // this.location.go(`navbar/${this.selectedInnerItem}`);

    // // Use router outlet to display different component
    // this.saveVariables();

    // // this.router.navigate(['/navbar', `${this.selectedInnerItem}`]);

    // } 

    this.saveVariables();
  }


  // popList(event: PopStateEvent) {
  //   //if stack is not empty...
  //   if (this.backStack.length > 1 && this.backStackIdx > 0) {

  //     const newState = event.state.url;

  //     // this.selectedOuterItem = 'setting';

  //     if (newState === `navbar/${this.backStack[this.backStack.length - 1]}`) {
  //       // console.log('Matching with backStack');
  //     this.backStackIdx -= 1;


  //       // Push the current selected item to the front stack before updating it
  //       this.frontStack.push(this.selectedInnerItem);
  //         // Update the selected item by popping from the back stack
  //         const lastItem = this.backStack[this.backStackIdx-1];
  //     // Find item from the item set
  //     const newItem = this.findInnerItem(lastItem);
  //     // Change outer item and inner item

  //     if (newItem.parent_id) {
  //       this.selectedOuterItem = newItem.parent_id;
  //     }


  //     // console.log(this.selectedInnerItem);
  //     const poppedItem = this.backStack.pop();
  //                   // this.selectedInnerItem = poppedItem;
  //     // this.location.go(`navbar/${this.selectedInnerItem}`);
  //     this.selectedOuterItem = this.innerNavItems.find(item => item.id === this.selectedInnerItem)!.parent_id as string;
  //     this.selectedInnerItem = newItem.id;

  //     this.router.navigate(['/navbar', `${this.selectedInnerItem}`]);
  //         // this.selectedOuterItem = this.innerNavItems.find(item => item.id === this.selectedInnerItem)!.parent_id as string;
  //                       // Filter out any empty string from backStack
  //       // this.backStack = this.backStack.filter(item => item !== "");
  //         // Debug: Output the new state of both stacks
  //       // console.log('Updated backStack:', JSON.stringify(this.backStack));
  //       // console.log('Updated frontStack:', JSON.stringify(this.frontStack));
  //             } else if (newState === `navbar/${this.frontStack[this.frontStack.length - 1]}`) {
  //       // console.log('Matching with frontStack');

  //       // Push the current selected item to the back stack before updating it
  //       // this.backStack.push(this.selectedInnerItem);

  //       // // Update the selected item by popping from the front stack
  //       // const poppedItem = this.frontStack.pop();
  //       // if (poppedItem) {
  //       //   this.selectedInnerItem = poppedItem;
  //       //   this.router.navigate(['/navbar', `${this.selectedInnerItem}`]);
  //       //   this.selectedOuterItem = this.innerNavItems.find(item => item.id === this.selectedInnerItem)!.parent_id as string;
  //       // }

  //       // // Filter out any empty string from backStack
  //       // this.backStack = this.backStack.filter(item => item !== "");

  //       // Debug: Output the new state of both stacks
  //       // console.log('Updated backStack:', JSON.stringify(this.backStack));
  //       // console.log('Updated frontStack:', JSON.stringify(this.frontStack));
  //     }
  //     // Decrement the back stack index by 1
  //     // Find last item by using the deremented back stack index
  //     // const lastItem = this.backStack[this.backStackIdx];
  //     // Find item from the item set
  //     // const newItem = this.findInnerItem(lastItem);
  //     // Change outer item and inner item
  //     // if (newItem.parent_id) {
  //     //   this.selectedOuterItem = newItem.parent_id;
  //     // }
  //     // this.selectedInnerItem = newItem.id;
  //     // console.log("Going back to item " + this.selectedInnerItem);

  //     // Make the url uniform to the selectedItem name (doesn't actually change the component, just changes look of url)
  //     // this.location.go(`navbar/${this.selectedInnerItem}`);

  //     // Use router outlet to display different component
  //     // this.router.navigate(['/navbar', `${this.selectedInnerItem}`]);
  //     this.saveVariables();
  //   } else { // Else if the index is at the head of the back stack, then remain on current selected inner item
  //     // this.location.go(`navbar/${this.selectedInnerItem}`);
  //     this.router.navigate(['/navbar', `${this.selectedInnerItem}`]);
  //   }
  // }

  //take string from button click
  selectInnerItem(innerItem: string) {
    // Add the selected component to the backStack list
    const newItem = this.findInnerItem(innerItem);
    // Find the index of the selected inner item in the array of bottom nav items
    const selectedIndex = this.getBottomNavItems().findIndex(item => item.id === innerItem);
    // Update the activeTabIndex
    this.activeTabIndex = selectedIndex;

    this.selectedInnerItem = innerItem;
    this.currentComponentTitle = newItem.label;
    if (newItem.parent_id) {
      this.selectedOuterItem = newItem.parent_id;
    }
    // console.log("Changing item to " + this.selectedInnerItem);
    // When a component is selected push the component id to the stack. Store for late use when the user selected the browser's back button
    // if (this.backStack.length - 1 != this.backStackIdx) {
    //   this.backStack = this.backStack.slice(0, this.backStackIdx + 1);
    // }
    this.backStack.push(this.selectedInnerItem);
    this.backStackIdx += 1;
    // console.log("Current backStack:" + this.backStack);
    const currentState = `navbar/${this.selectedInnerItem}`;
    // if(this.backStack.length >0 && currentState===`navbar/${this.backStack[this.backStack.length - 1]}`){
    //   this.backStack.pop();
    //   return;
    // }
    // this.backStack = this.backStack.filter(item => item !== "");
    // Make the url uniform to the selectedItem name (doesn't actually change the component, just changes look of url)
    // this.location.go(`navbar/${this.selectedInnerItem}`);
    this.router.navigate(['/navbar', `${this.selectedInnerItem}`]);
    if (currentState != `navbar/${this.backStack[this.backStack.length - 1]}`) {
      history.pushState({ url: currentState }, '', currentState);
    }
    // history.pushState({ url: currentState }, '', currentState);
    this.saveVariables();
  }

  // Use this function to make sure intended item exist in data array
  findInnerItem(innerItem: string) {
    // console.log("Finding item: " + innerItem);
    const findItem = this.innerNavItems.find(item => item.id === innerItem);
    if (findItem) {
      // console.log("Found item: " + findItem.id);
      return findItem;
    } else {
      // console.log("Cannot find item");
      const errorItem: MenuItem = {
        parent_id: '404',
        id: '404',
        label: '404 Error',
        description: '404 Error'
      }
      return errorItem;
    }
  }

  selectOuterItem(item: string) {
    if (item === 'exit') {
      this.router.navigate(['/logout']);
    } else if (item === 'chat') {
      console.log("Loading chat list...");
      this.connectChatService();
      this.selectInnerItem('message');
    }
    else {
      // this.router.navigate([`/${item}`]);
      this.selectedOuterItem = item;
    }
  }

  getInnerItemsByOuterItem(selectedOuterItem: string): MenuItem[] {
    return this.innerNavItems.filter((item) => item.parent_id === selectedOuterItem);
  }

  onTabClick(item: MenuItem, tabIndex: number) {
    if (this.activeTabIndex !== tabIndex) {
      console.log("Changing tab");
      this.selectOuterItem(item.id);
      if (item.default_child) {
        this.selectInnerItem(item.default_child);
      }
    }
  }

  goBack(): void {
    if (this.backStack.length > 1 && this.backStackIdx > 0) {
      // Decrement the back stack index by 1
      this.backStackIdx -= 1;
      // Find last item by using the decremented back stack index
      const lastItem = this.backStack[this.backStackIdx];
      // Find item from the item set
      const newItem = this.findInnerItem(lastItem);
      // Change outer item and inner item
      if (newItem.parent_id) {
        this.selectedOuterItem = newItem.parent_id;
      }
      this.selectedInnerItem = newItem.id;
      // Update the URL
      this.router.navigate(['/navbar', `${this.selectedInnerItem}`]);
      // Set the currentComponentTitle
      this.currentComponentTitle = newItem.label;
      // Save variables
      this.saveVariables();
    } else {
      // If the index is at the head of the back stack, remain on the current selected inner item
      this.router.navigate(['/navbar', `${this.selectedInnerItem}`]);
    }
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.screenWidth = window.innerWidth;
  }

  getBottomNavItems(): MenuItem[] {
    const allowedIds = ['home', 'workout', 'nutrition', 'social', 'chat'];
    return this.outerNavItems.filter(item => allowedIds.includes(item.id));
  }

  // List of outer navigation bar items
  outerNavItems: MenuItem[] = [
    { id: 'home', icon: 'home', label: 'Home', default_child: 'homepage' },
    { id: 'setting', icon: 'settings', label: 'Setting', default_child: '404' },
    { id: 'workout', icon: 'directions_run', label: 'Workouts', default_child: 'workout_info' },
    { id: 'nutrition', icon: 'local_dining', label: 'Nutrition', default_child: 'calorieinformation' },
    { id: 'social', icon: 'people', label: 'Social', default_child: 'friendfinder' },
    { id: 'chat', icon: 'chat_bubble_outline', label: 'Chat', default_child: 'chatlist' },
    { id: 'exit', icon: 'exit_to_app', label: "Sign out", default_child: '404' },
  ]

  innerNavItems: MenuItem[] = [
    {
      parent_id: 'home',
      id: 'homepage',
      label: 'Home',
      description: 'Homepage',
    },
    {
      parent_id: 'home',
      id: 'achievements',
      label: 'Achievements',
      description: 'View your achievements',
    },
    {
      parent_id: 'home',
      id: 'userhomepage',
      label: 'Future User Homepage',
      description: 'Future User Homepage',
    },
    {
      parent_id: 'setting',
      id: 'account',
      label: 'Account',
      description: 'Change name, edit profile picture, view block list, set status, terminate account',
    },
    {
      parent_id: 'setting',
      id: 'settingsfitnesscalorie',
      label: 'Calorie Settings',
      description: 'Change units, show graphs, toggle information'
    },
    {
      parent_id: 'setting',
      id: 'soundandnotifications',
      label: 'Sound and Notifications',
      description: 'Change volume levels, toggle notifications'
    },
    {
      parent_id: 'setting',
      id: 'changepassword',
      label: 'Change Password',
      description: 'Change user password',
    },
    {
      parent_id: 'setting',
      id: 'fontsize',
      label: 'Font Size',
      description: 'Change display font size',
    },
    {
      parent_id: 'setting',
      id: 'faq',
      label: 'FAQ',
      description: 'Frequently asked questions',
    },
    {
      parent_id: 'setting',
      id: 'contactus',
      label: 'Contact Us',
      description: 'Feel free to contact us for any questions or feedbacks',
    },
    {
      parent_id: 'setting',
      id: 'accounttermination',
      label: 'Terminate Account',
      description: 'Terminate your account and all relating data here.',
    },
    {
      parent_id: 'workout',
      id: 'workout_info',
      label: 'Workout Info',
      description: 'Workout details',
    },
    {
      parent_id: 'workout',
      id: 'personalfitnessgoals',
      label: 'Fitness Goals',
      description: 'Enter fitness goals',
    },
    {
      parent_id: 'workout',
      id: 'workoutentry',
      label: 'Workout Entry',
      description: 'Enter workout',
    },
    {
      parent_id: 'nutrition',
      id: 'calorieinformation',
      label: 'Calorie Info',
      description: 'Calorie info',
    },
    {
      parent_id: 'nutrition',
      id: 'foodentry',
      label: 'Food Entry',
      description: 'Enter food eaten',
    },
    {
      parent_id: 'social',
      id: 'socialpage',
      label: 'Social',
      description: 'View your social page',
    },
    {
      parent_id: 'social',
      id: 'friendfinder',
      label: 'Friend Finder',
      description: 'Find friends',
    },
    {
      parent_id: 'social',
      id: 'groupfinder',
      label: 'Group Finder',
      description: 'Find groups',
    },
    {
      parent_id: 'social',
      id: 'profilepage',
      label: 'Profile Page',
      description: 'View other profiles',
    },
    {
      parent_id: 'social',
      id: 'grouppage',
      label: 'Group Page',
      description: 'View other groups',
    },
    {
      parent_id: 'social',
      id: 'groupsettings',
      label: 'Group Setting',
      description: 'Group settings',
    },
    {
      parent_id: 'social',
      id: 'groupcreate',
      label: 'Group Create',
      description: 'Group create',
    },
    {
      parent_id: 'chat',
      id: 'message',
      label: 'Chat',
      description: 'Chat messages',
    },
    {
      parent_id: 'chat',
      id: 'chatlist',
      label: 'Chat List',
      description: 'List of all chats',
    },
    // {
    //   parent_id: 'social',
    //   id: 'reportpage',
    //   label: 'Report Page',
    //   description: 'Report a user being inappropriate here',
    // },
  ];

  // The following is for chat list in side navigation
  @ViewChild('messageInput', { static: false }) messageInputRef: ElementRef;
  connected = false;
  listConversationsResult: string | null;
  selectedChannel: SendBird.GroupChannel;
  messages: Array<SendBird.UserMessage | SendBird.AdminMessage> | null;
  startConversationResult: string;
  conversations: Array<SendBird.GroupChannel>;
  textMessage: any;
  searchQuery: string;
  filteredChannels: any[];
  autocompleteResults: any[];
  showAutocomplete: boolean;
  sbUserId: string;
  sbUserName: string;

  messageText: string = '';
  selectedChannelName: string;
  activeChannelIdx: number = -1;

  connectChatService() {
    this.chatService.init();
    const token = this.storageService.getTokenValue();
    this.sbUserName = this.getToken.getUserNameFromToken(token) || '0';
    this.sbUserId = this.getToken.getUserIdFromToken(token) || '0';
    this.connect();
    this.registerEventHandlers();
    this.getMyConversations();
  }

  goToChatPage(channel: SendBird.GroupChannel, activeIndex: number) {
    this.activeChannelIdx = activeIndex;
    this.chatService.setSelectedChannelName(channel);
    this.router.navigate(['/navbar', 'message', activeIndex]);
    this.connect();
  }

  connect() {
    this.chatService.connect(this.sbUserId, null, (error: any, user: any) => {
      if (!error) {
        // We are connected to Sendbird servers!
        this.registerEventHandlers();
        this.getMyConversations();
        this.connected = true;
      }
    });
  }

  registerEventHandlers() {
    this.chatService.registerEventHandlers(
      '123',
      (data: { event: string; data: any }) => {
        console.log('New event: ' + data.event, data.data);
        if (this.selectedChannel) {
          if (data.event == 'onMessageReceived' && this.messages) {
            if (data.data.channel.url == this.selectedChannel.url) {
              this.messages.push(data.data.message);
            }
          }
        }
      }
    );
  }

  startConversation() {
    let channelName = 'android-tutorial';
    let userIds = ['01'];
    this.chatService.createGroupChannel(
      channelName,
      userIds,
      (error: SendBird.SendBirdError, groupChannel: SendBird.GroupChannel) => {
        if (error) {
          this.startConversationResult = 'Error creating the conversation';
        } else {
          this.startConversationResult = 'Conversation created';
          this.getMyConversations();
        }
      }
    );
  }

  getMyConversations() {
    this.chatService.getMyGroupChannels(this.sbUserId,
      (
        error: SendBird.SendBirdError,
        groupChannels: Array<SendBird.GroupChannel>
      ) => {
        if (error) {
          this.listConversationsResult = 'Unable to get your conversations';
        } else {
          this.conversations = groupChannels;
        }
      }
    );
  }

  getMessages(channel: SendBird.GroupChannel) {
    this.selectedChannel = channel;
    this.chatService.getMessagesFromChannel(
      channel,
      (
        error: SendBird.SendBirdError,
        messages: Array<
          SendBird.UserMessage | SendBird.AdminMessage
        >
      ) => {
        if (!error) {
          this.messages = messages;
          this.selectedChannelName = channel.name;
        }
      }
    );
  }

  getLastMessage(channel: SendBird.GroupChannel) {
    if (channel.lastMessage?.isUserMessage() || channel.lastMessage?.isAdminMessage()) {
      return channel.lastMessage.message;
    } else {
      return 'No messages';
    }
  }

  getLastMessageDate(channel: SendBird.GroupChannel) {
    if (channel.lastMessage) {
      return this.formatTimestamp(channel.lastMessage.createdAt);
    } else {
      return '';
    }
  }

  updateTextMessage(event: any) {
    const value = event.target.value;
    if (!value || !this.selectedChannel) {
      return;
    }
    this.textMessage = value;
  }

  sendMessage() {
    if (this.textMessage.trim() !== '') {
      this.chatService.sendMessage(
        this.selectedChannel,
        this.textMessage,
        (error: SendBird.SendBirdError, userMessage: SendBird.UserMessage) => {
          this.getMessages(this.selectedChannel);
          this.textMessage = ''; // Clear the input text
          this.messageInputRef.nativeElement.value = ''; // Clear the input value
          this.messageInputRef.nativeElement.focus(); // Focus the input again
        }
      );
    }
  }

  formatTimestamp(timestamp: number) {
    const date = new Date(timestamp);
    const monthAbbreviation = date.toLocaleString('default', { month: 'short' });
    const day = ('0' + date.getDate()).slice(-2);
    const year = date.getFullYear();
    const hours = date.getHours() % 12 || 12;
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const time = `${hours}:${minutes}`;
    const ampm = date.getHours() < 12 ? 'am' : 'pm';
    const formattedTimestamp = `${monthAbbreviation}. ${day} ${year} | ${time}${ampm}`;

    return formattedTimestamp;
  }
}