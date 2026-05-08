import { Component, effect, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChatService } from '../../../../core/services/chat.service';
import { ChatSession } from '../../../../core/models/chat-session.model';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Message } from '../../../../core/models/message.model';
import { ConfirmationDialog } from '../../../../shared/components/confirmation-dialog/confirmation-dialog';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago-pipe';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-chat-page',
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatDialogModule,
    TimeAgoPipe,
  ],
  templateUrl: './chat-page.html',
  styleUrl: './chat-page.scss',
})
export class ChatPage implements OnInit {
  private readonly chatService = inject(ChatService);
  private readonly dialog = inject(MatDialog);
  private readonly notificationService = inject(NotificationService);

  @ViewChild('messagesContainer') messageContainer!: ElementRef;

  chats = signal<ChatSession[]>([]);
  activeChat = signal<ChatSession | null>(null);
  messages = signal<Message[]>([]);
  messageInput = signal<string>('');

  isLoadingChats = signal<boolean>(false);
  isCreatingChat = signal<boolean>(false);
  isLoadingMessages = signal<boolean>(false);
  isSendingMessage = signal<boolean>(false);

  constructor() {
    effect(() => {
      if (this.messages().length > 0) {
        this.scrollToBottom();
      }
    });
  }

  ngOnInit() {
    this.loadChats();
  }

  /**
   * Load all existing chats when page opens.
   */
  loadChats() {
    this.isLoadingChats.set(true);

    this.chatService.getAllChats().subscribe({
      next: (chats) => {
        this.chats.set(chats);
        this.isLoadingChats.set(false);
      },
      error: (err) => {
        console.error('Failed to load chats:', err);
        this.isLoadingChats.set(false);
        this.notificationService.error('Failed to load chats. Please refresh the page.');
      },
    });
  }

  /**
   * Create a new chat and set it as active.
   */
  createNewChat(): void {
    this.isCreatingChat.set(true);

    this.chatService.createChat().subscribe({
      next: (newChat) => {
        // Add to the TOP of the list (newest first)
        this.chats.update((current) => [newChat, ...current]);

        // Set as the active chat
        this.activeChat.set(newChat);
        this.messages.set([]);
        this.isCreatingChat.set(false);
      },
      error: (err) => {
        console.error('Failed to create chat:', err);
        this.isCreatingChat.set(false);
        this.notificationService.error('Failed to create chat. Please try again.');
      },
    });
  }

  loadMessages(chatId: number): void {
    this.isLoadingMessages.set(true);
    this.messages.set([]);

    this.chatService.getMessage(chatId).subscribe({
      next: (messages) => {
        this.messages.set(messages);
        this.isLoadingMessages.set(false);
      },
      error: (err) => {
        console.log('Failed to load messages:', err);
        this.isLoadingMessages.set(false);
        this.notificationService.error('Failed to create chat. Please try again.');
      },
    });
  }

  sendMessage(): void {
    const content = this.messageInput().trim();

    // Guard: don't send empty messages or while already sending
    if (!content || this.isSendingMessage()) return;

    const chatId = this.activeChat()?.id;
    if (!chatId) return;

    // Clear input immediately (feels responsive)
    this.messageInput.set('');
    this.isSendingMessage.set(true);

    this.chatService.sendMessage(chatId, content).subscribe({
      next: (newMessages) => {
        // Add both [userMessage, botMessage] to the list
        this.messages.update((current) => [...current, ...newMessages]);
        this.isSendingMessage.set(false);
      },
      error: (err) => {
        console.error('Failed to send message:', err);
        this.isSendingMessage.set(false);
        this.notificationService.error('Failed to create chat. Please try again.');
      },
    });
  }

  openDeleteDialog(chatId: number, event: MouseEvent): void {
    event.stopPropagation(); // Prevent chat selection when clicking the menu button

    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '350px',
      data: {
        title: 'Delete Chat',
        message:
          'Are you sure you want to delete this chat and all its messages? This action cannot be undone.',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      // result will be `true` if the user clicked "Delete"
      if (result) {
        this.deleteChat(chatId);
      }
    });
  }

  private deleteChat(chatId: number): void {
    this.chatService.deleteChat(chatId).subscribe({
      next: () => {
        // Remove the chat from the local list
        this.chats.update((currentChats) => currentChats.filter((c) => c.id !== chatId));

        // If the deleted chat was the active one, clear the view
        if (this.activeChat()?.id === chatId) {
          this.activeChat.set(null);
          this.messages.set([]);
        }
        this.notificationService.success('Chat deleted successfully.');
      },
      error: (err) => {
        console.error('Failed to delete chat:', err);
        this.notificationService.error('Failed to create chat. Please try again.');
      },
    });
  }
  
  /**
   * Select an existing chat to view.
   */
  selectChat(chat: ChatSession): void {
    this.activeChat.set(chat);
    this.loadMessages(chat.id);
  }

  /**
   * Check if a chat is the currently active one.
   */
  isActive(chat: ChatSession): boolean {
    return this.activeChat()?.id === chat.id;
  }

  /**
   * Scroll the messages container to the very bottom.
   * setTimeout(0) waits for Angular to finish rendering new messages first.
   */
  private scrollToBottom(): void {
    setTimeout(() => {
      const container = this.messageContainer?.nativeElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 0);
  }
}
