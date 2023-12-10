import { Component, ElementRef, ViewChild, ChangeDetectorRef, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute, ActivationEnd } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import SendBird from 'sendbird';
import { environment } from 'src/environments/environment.development';
import { StorageService } from '../storage.service';
import { GetToken } from 'src/utilFunctionTokenService.service';
import {
  MatBottomSheet,
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import {MatListModule} from '@angular/material/list';
import {MatButtonModule} from '@angular/material/button';


@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  /* standalone: true,
  imports: [MatButtonModule, MatBottomSheetModule], */
  styleUrls: ['./chat-page.component.css', '../../assets/Stylesheet/mainbox.css']
})
export class ChatPageComponent {
  title = 'myapp';
  @ViewChild('messageInput', { static: false }) messageInputRef: ElementRef;

  connected = false;
  listConversationsResult: string | null;
  globalChannel: SendBird.GroupChannel;
  selectedChannel: SendBird.GroupChannel;
  messages: Array<SendBird.UserMessage | SendBird.AdminMessage> | null;
  startConversationResult: string;
  conversations: Array<SendBird.GroupChannel> | null;
  textMessage: any;
  userId: string;
  API_Token: string;
  userName: string;
  joinUserIds: string[];
  messageText: string = '';
  selectedChannelName: string;

  constructor(private chatService: ChatService, private cdr: ChangeDetectorRef, private route: ActivatedRoute,
    private _bottomSheet: MatBottomSheet, private storageService: StorageService, private getToken: GetToken) {
    this.route.params.subscribe(params => {
      this.changeConversation();
    });
    this.API_Token = environment.API_TOKEN;
  }
  
  //here
  openBottomSheet(): void {
    const bottomSheetRef = this._bottomSheet.open(BottomSheetOverviewExampleSheet);
  bottomSheetRef.instance.selectedOptionEmitter.subscribe(async (selectedOption: string) => {
    console.log('Selected option:', selectedOption);
    
    this.selectedChannel.muteUser(this.chatService.getUser(),parseInt(selectedOption),'UserMuted')

    /* this.chatService.muteUser(this.selectedChannel, this.chatService.getUser(), (error: any, response: any) => {
      if (!error) {
        // Handle success
        console.log('User muted successfully:', response);
      } else {
        // Handle error
        console.error('Failed to mute user:', error);
      }
    }); */
    
  });

  }







  @ViewChild('messageList') private messageList: ElementRef;

  ngOnInit() {
    console.log("Initializing chat page component...");
    this.chatService.init();
    //changes to get the conversations in real time
    this.changeConversation();
    const token = this.storageService.getTokenValue();
    this.userName = this.getToken.getUserNameFromToken(token) || '0';
    this.userId = this.getToken.getUserIdFromToken(token) || '0';
  }

  changeConversation() {
    this.connect();
    this.registerEventHandlers();
    this.getMyConversations();
    this.getMessages(this.chatService.getSelectedChannelName());
  }

  connect() {
    this.chatService.connect(this.userId, this.API_Token, (error: any, user: any) => {
      if (!error) {
        this.connected = true;
      }
    });

  }

  createUser() {
    this.chatService.createUser(this.userId, this.userName, '').subscribe(
      response => {
        console.log('User created successfully:', response);
        // Handle the response or perform any additional actions
      },
      error => {
        console.error('Error creating user:', error);
      }
    );
    this.chatService.getGlobalChat().then((channel: SendBird.GroupChannel) => {
      this.globalChannel = channel;
      this.joinUserIds = [this.userId];
      console.log(this.joinUserIds, this.globalChannel)
      this.chatService.inviteUser(this.globalChannel, this.joinUserIds)
      .then(response => {
        console.log('Users invited successfully:', response);
      })
      .catch(error => {
        console.error('Failed to invite users:', error);
      });
    }).catch((error: any) => {
      // Handle any errors that occur during the retrieval
      console.error('Failed to retrieve global chat:', error);
    });
  }

  deleteUser() {
    this.chatService.deleteUser(this.userId)
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
              this.cdr.detectChanges();
              this.scrollToBottom();
            }
          } 
          
          else if (data.event === 'onUserMuted' || data.event === 'onUserUnmuted') {
            const affectedUser = data.data.user;
            console.log('User status changed:', affectedUser);
    
            
            if (data.event === 'onUserMuted') {
              
              console.log('Usuario muteado:', affectedUser);
            } else if (data.event === 'onUserUnmuted') {
              
              console.log('Usuario desmuteado:', affectedUser);
            }
          }
        }
      });
    }



  startConversation() {
    let channelName = 'android-tutorial';
    let userIds = [this.userId];
    this.chatService.createGroupChannel(
      channelName,
      userIds,
      (error: SendBird.SendBirdError, groupChannel: SendBird.GroupChannel) => {
        if (error) {
          this.startConversationResult = 'Error creating the conversation';
        } else {
          this.startConversationResult = 'Conversation created';
          this.getMyConversations();

          //changes to get the conversations in real time
          this.chatService.getMessages(groupChannel, (error: SendBird.SendBirdError, messages: any) => {
            if (!error) {
              this.messages = messages;
            }
          });
        }
      }
    );
  }

  getMyConversations() {
    this.chatService.getMyGroupChannels(this.userId,
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
    this.selectedChannelName = channel.name;
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
        }
      }
    );
  }

  updateTextMessage(event: any) {
    const value = event.target.value;
    if (!value || !this.selectedChannel) {
      return;
    }
    this.textMessage = value;
  }

  sendMessage() {
    this.chatService.sendMessage(
      this.selectedChannel,
      this.textMessage,
      (error: SendBird.SendBirdError, userMessage: SendBird.UserMessage) => {
        this.getMessages(this.selectedChannel);
      }
    );
  }

  scrollToBottom() {
    if (this.messageList) {
      const element = this.messageList.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  formatTimestamp(timestamp: number) {
    const date = new Date(timestamp);
    const monthAbbreviation = date.toLocaleString('default', { month: 'short' });
    const day = ('0' + date.getDate()).slice(-2);
    const year = date.getFullYear();
    const hours = date.getHours() % 12 || 12; // Convert to 12-hour format
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const time = `${hours}:${minutes}`;
    const ampm = date.getHours() < 12 ? 'am' : 'pm';
    const formattedTimestamp = `${monthAbbreviation}. ${day} ${year} | ${time}${ampm}`;
    return formattedTimestamp;
  }

  leaveChannel() {
    this.chatService.leaveChannel(this.selectedChannel, this.userId);
  }

  createGlobalChat() {
    let channelName = "Global Chat";
    let userIds = ['899353'];
    this.chatService.createGlobalChat(
      channelName,
      userIds, 
      (error: SendBird.SendBirdError, groupChannel: SendBird.GroupChannel) => {
        if (error) {
          console.error('Error creating supergroup:', error);
        } else {
          console.log('Supergroup created:', groupChannel);
        }
      }
    );
  }
}



//here
@Component({
  selector: 'chat-page-sheet',
  templateUrl: 'chat-page-sheet.component.html',
  standalone: true,
  imports: [MatListModule],
})
export class BottomSheetOverviewExampleSheet {

  selectedOptionEmitter = new EventEmitter<string>();
  constructor(private _bottomSheetRef: MatBottomSheetRef<BottomSheetOverviewExampleSheet>) {}

  openLink(option: string): void {
    this.selectedOptionEmitter.emit(option);
    this._bottomSheetRef.dismiss();

    //event.preventDefault();
  }
}