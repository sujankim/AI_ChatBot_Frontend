import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatSession } from '../models/chat-session.model';
import { Message } from '../models/message.model';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/chats`;

  createChat(): Observable<ChatSession> {
    return this.http.post<ChatSession>(this.apiUrl, {});
  }

  getAllChats(): Observable<ChatSession[]> {
    return this.http.get<ChatSession[]>(this.apiUrl);
  }

  sendMessage(chatId: number, content: string): Observable<Message[]> {
    return this.http.post<Message[]>(`${this.apiUrl}/${chatId}/messages`, { content });
  }

  getMessage(chatId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/${chatId}/messages`);
  }

  deleteChat(chatId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${chatId}`);
  }
}
