
# 💬 AI Chatbot Frontend

> Modern Angular 21 frontend for an AI-powered chatbot application with responsive UI, JWT authentication, Google OAuth2 login, Markdown rendering, and real-time conversational experience.

![Angular](https://img.shields.io/badge/Angular-21-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Angular Material](https://img.shields.io/badge/Angular_Material-21-purple)
![Vercel](https://img.shields.io/badge/Deployment-Vercel-black)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## 🌐 Live Application

- Frontend: https://chatbot-frontend-plum-two.vercel.app
- Backend API: https://chatbot-backend-a3su.onrender.com

---

# 🚀 Features

- 🔐 JWT Authentication
- 🌍 Google OAuth2 Login
- 💬 Persistent Chat Sessions
- 🤖 Gemini AI Chat Experience
- 📱 Fully Responsive Design
- 🎨 Angular Material UI
- 🧠 Markdown Rendering for AI Responses
- ⚡ Angular Signals State Management
- 🔄 Auto Token Refresh
- 🐳 Docker Support
- 🚀 Vercel Deployment

---

# 🛠️ Tech Stack

| Technology | Version |
|------------|---------|
| Angular | 21 |
| TypeScript | 5.x |
| RxJS | 7.x |
| Angular Material | 21 |
| SCSS | Latest |
| Node.js | 22.15.0 |

---

# 🏛️ Frontend Architecture

```text
src/app/
├── core/
├── features/
├── shared/
├── styles/
└── environments/
```

---

# 📁 Main Features

## Authentication

- Login
- Register
- JWT Token Handling
- OAuth2 Google Login
- Route Guards
- HTTP Interceptors

## Chat System

- Create/Delete Chats
- Persistent History
- Markdown Messages
- Typing Indicator
- Auto Scroll
- Responsive Sidebar

---

# 💻 Local Development

## Prerequisites

- Node.js 22+
- Angular CLI

## Clone Repository

```bash
git clone https://github.com/sujankim/AI_ChatBot_Frontend.git
cd AI_ChatBot_Frontend
```

## Install Dependencies

```bash
npm install
```

## Start Development Server

```bash
ng serve
```

Application runs at:

```text
http://localhost:4200
```

---

# ⚙️ Environment Configuration

## environment.ts

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

## environment.prod.ts

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://chatbot-backend-a3su.onrender.com/api'
};
```

---

# 🐳 Docker

## Build Docker Image

```bash
docker build -t chatbot-frontend .
```

## Run Docker Container

```bash
docker run -p 80:80 chatbot-frontend
```

---

# 🚀 Deployment

## Vercel Deployment

Build Command:

```bash
npm run build -- --configuration=production
```

Output Directory:

```text
dist/chat-bot-frontend/browser
```

---

# 🧪 Code Quality

Recommended tools:

- ESLint
- Prettier
- Angular Strict Mode

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

Built by Sujan using Angular 21, Angular Material, and Gemini AI.
