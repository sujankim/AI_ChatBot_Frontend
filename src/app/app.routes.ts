import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { OauthCallback } from './features/auth/pages/oauth-callback/oauth-callback';

export const routes: Routes = [
  // ─── Default redirect ──────────────────────────────────────────────────
  {
    path: '',
    redirectTo: 'chat',
    pathMatch: 'full',
  },

  // ─── Auth routes (public — no guard) ───────────────────────────────────
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login-page/login-page').then((m) => m.LoginPage),
    title: 'Sign In — AI Chatbot',
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/pages/register-page/register-page')
        .then((m) => m.RegisterPage),
    title: 'Create Account — AI Chatbot',
  },
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('./features/auth/pages/oauth-callback/oauth-callback')
        .then((m) => m.OauthCallback),
    // No title — this page is a 1-second redirect, user never reads it
  },

  // ─── Protected routes (requires login) ─────────────────────────────────
  {
    path: 'chat',
    canActivate: [authGuard], // ← Guard runs before rendering
    loadComponent: () =>
      import('./features/chat/pages/chat-page/chat-page')
        .then((m) => m.ChatPage),
    title: 'Chat — AI Chatbot',
  },

  // ─── Wildcard: redirect anything unknown to login ───────────────────────
  {
    path: '**',
    redirectTo: 'login',
  },
];
