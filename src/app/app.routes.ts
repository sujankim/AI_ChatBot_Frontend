import { Routes } from '@angular/router';
import { ChatPage } from './features/chat/pages/chat-page/chat-page';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'chat',
    pathMatch: 'full', // '' exactly → redirect to /chat
  },
  {
    path: 'chat',
    component: ChatPage,
  },
  {
    path: '**', // Any unknown route
    redirectTo: 'chat',
  },
];
