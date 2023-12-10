import { Component, ElementRef, ViewChild } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { Router } from '@angular/router';
import SendBird from 'sendbird';
import { StorageService } from '../storage.service';
import { GetToken } from 'src/utilFunctionTokenService.service';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css', '../../assets/Stylesheet/mainbox.css']
})
export class ChatListComponent {
  title = 'myapp';
  @ViewChild('messageInput', { static: false }) messageInputRef: ElementRef;

  connected = false;
  listConversationsResult: string | null;
  selectedChannel: SendBird.GroupChannel;
  globalChannel: SendBird.GroupChannel;
  messages: Array<SendBird.UserMessage | SendBird.AdminMessage> | null;
  startConversationResult: string;
  conversations: Array<SendBird.GroupChannel>;
  textMessage: any;
  searchQuery: string;
  filteredChannels: any[];
  autocompleteResults: any[];
  showAutocomplete: boolean;
  userId: string;
  userName: string;

  constructor(private chatService: ChatService, private router: Router, 
    private storageService: StorageService, private getToken: GetToken) { }


  messageText: string = '';
  selectedChannelName: string;

  ngOnInit() {
    this.chatService.init();
    //changes to get the conversations in real time
    const token = this.storageService.getTokenValue();
    this.userName = this.getToken.getUserNameFromToken(token) || '0';
    this.userId = this.getToken.getUserIdFromToken(token) || '0';
    this.connect();
    this.registerEventHandlers();
    this.getMyConversations();
  }

  ngAfterViewInit() {
    this.chatService.init();
    const token = this.storageService.getTokenValue();
    this.userName = this.getToken.getUserNameFromToken(token) || '0';
    this.userId = this.getToken.getUserIdFromToken(token) || '0';
    this.connect();
    this.registerEventHandlers();
    this.getMyConversations();
  }

  goToChatPage(channel: SendBird.GroupChannel) {
    this.chatService.setSelectedChannelName(channel);
    // this.router.navigate(['/ChatPage']);
    this.router.navigate(['/navbar', 'message', 0]);
    const token = this.storageService.getTokenValue();
    this.userName = this.getToken.getUserNameFromToken(token) || '0';
    this.userId = this.getToken.getUserIdFromToken(token) || '0';
    this.connect();
  }

  connect() {
    this.chatService.connect(this.userId, null, (error: any, user: any) => {
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
        }
      }
    );
  }

  getMyConversations() {
    console.log(this.userName, this.userId)
    this.chatService.getMyGroupChannels(this.userId,
      (
        error: SendBird.SendBirdError,
        groupChannels: Array<SendBird.GroupChannel>
      ) => {
        if (error) {
          this.listConversationsResult = 'Unable to get your conversations';
        } else {
            const specificChannelIndex = groupChannels.findIndex(channel => channel.url === 'sendbird_group_channel_203707888_065ad6b029d98ef0d19a095dfda44deb7c93c3a7');
            if (specificChannelIndex !== -1) {
              // Remove the specific channel from the array
              const specificChannel = groupChannels.splice(specificChannelIndex, 1)[0];

              // Add the specific channel at the beginning of the array
              groupChannels.unshift(specificChannel);
            }
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

  search(event: any) {
    this.filteredChannels = this.conversations.filter(channel => {
      return channel.name.toLowerCase().includes(this.searchQuery.toLowerCase());
    });
    this.autocompleteResults = this.conversations.filter(channel => {
      return channel.name.toLowerCase().startsWith(this.searchQuery.toLowerCase());
    });
    this.showAutocomplete = this.searchQuery.length > 0 && this.autocompleteResults.length > 0;
  }

  selectAutocomplete(channel: any) {
    this.searchQuery = channel.name;
    this.filteredChannels = this.conversations.filter(c => c.name === channel.name);
    this.showAutocomplete = false;
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


