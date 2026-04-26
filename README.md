<div align="center">

```
██████╗ ██████╗  █████╗ ███████╗████████╗███████╗██████╗  █████╗  ██████╗███████╗
██╔══██╗██╔══██╗██╔══██╗██╔════╝╚══██╔══╝██╔════╝██╔══██╗██╔══██╗██╔════╝██╔════╝
██║  ██║██████╔╝███████║█████╗     ██║   ███████╗██████╔╝███████║██║     █████╗  
██║  ██║██╔══██╗██╔══██║██╔══╝     ██║   ╚════██║██╔═══╝ ██╔══██║██║     ██╔══╝  
██████╔╝██║  ██║██║  ██║██║        ██║   ███████║██║     ██║  ██║╚██████╗███████╗
╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝        ╚═╝   ╚══════╝╚═╝     ╚═╝  ╚═╝ ╚═════╝╚══════╝
```

**AI-POWERED COLLABORATIVE WHITEBOARD**

*— Phase - 01 —*

---

![VERSION](https://img.shields.io/badge/VERSION-1.0.0-white?style=flat-square)
![WEB](https://img.shields.io/badge/WEB-LIVE-blue?style=flat-square)
![AI](https://img.shields.io/badge/🤖_AI-CLAUDE_+_GEMINI-white?style=flat-square)
![FRONTEND](https://img.shields.io/badge/⚛️_FRONTEND-NEXT.JS_14-white?style=flat-square)
![DATABASE](https://img.shields.io/badge/🍃_DATABASE-MONGODB_ATLAS-white?style=flat-square)
![REALTIME](https://img.shields.io/badge/⚡_REALTIME-SOCKET.IO-white?style=flat-square)
![DEPLOYED ON](https://img.shields.io/badge/🚀_DEPLOYED_ON-RAILWAY-white?style=flat-square)

</div>

---

**Draw. Generate. Collaborate.**

*DraftSpace is an AI-powered collaborative whiteboard where drawing and AI assistance live on the same canvas. Type a command anywhere on your canvas — `{ ai: }`, `{ img: }`, or `{ code: }` — and DraftSpace responds inline. No sidebar, no context switching, no leaving your workspace.*

---

| **Canvas** `Excalidraw` | **AI Layer** `Claude + Gemini` | **Collaboration** `Socket.io` | **Deployment** `Live on Railway` |
|---|---|---|---|
| Full free-form drawing with pen, shapes, text, and eraser | Three command types embedded directly in the canvas | Real-time sync with throttled broadcasting across sessions | Backend and frontend both deployed — try it without any setup |

---

> **What makes DraftSpace different**
> - AI commands live *on* the canvas, not in a sidebar or chat panel
> - Public `/` canvas — draw and use AI without creating an account
> - Three distinct AI command types: text, image, and code generation
> - Built with Next.js 14, Excalidraw, Socket.io, and MongoDB Atlas

---

<div align="center">

[**TRY IT LIVE →**](https://your-app.railway.app) &nbsp;&nbsp; [**VIEW ON GITHUB →**](https://github.com/yourusername/draftspace) &nbsp;&nbsp; [**REPORT A BUG →**](https://github.com/yourusername/draftspace/issues)

</div>

---

## What it does

| **Draw freely** | **Invoke AI inline** |
|---|---|
| The canvas is always open. Pen, shapes, text, eraser — the full Excalidraw toolkit. No account required to start drawing. | Type a command directly onto the canvas. DraftSpace detects it, sends it to the AI, and places the response right where you typed. |

| **Generate images on canvas** | **Collaborate in real time** |
|---|---|
| `{ img: a futuristic city at dusk }` — Gemini generates the image and places it inline as a canvas element. | Multiple users on the same canvas, changes broadcast via Socket.io with an 80ms throttle. No conflicts visible to the user. |

| **Save and manage boards** | **Use it without signing up** |
|---|---|
| Auto-save fires after 3 seconds of idle. A dashboard lists all your boards with rename, delete, and open controls. | Hit the `/` route — the canvas loads instantly. AI commands work. No account, no onboarding, no wall. |

---

## AI command system

Three command types, all typed directly on the canvas:

```
{ ai: explain how recursion works }      →  text block placed on canvas
{ img: a cat sitting on a moonlit roof } →  AI-generated image placed inline
{ code: python quicksort }               →  syntax-highlighted code block
```

Commands are detected when you press Enter or click away. The parser sends matched commands to the appropriate API route — Claude for `ai` and `code`, Gemini 2.0 Flash for `img` — and places the response as a new canvas element near the original.

---

## Get started in 30 seconds

**1. Open it in your browser**

```
https://your-app.railway.app
```

The canvas loads immediately. No account required. Type `{ ai: hello }` anywhere on the canvas and press Enter.

> ⚠️ The backend runs on a free Railway instance and may take up to 30 seconds to wake on the first visit after a period of inactivity.

**2. Or run it locally**

```bash
git clone https://github.com/yourusername/draftspace
cd draftspace
npm install
cp .env.example .env.local   # fill in your keys
node server.js               # starts Next.js + Socket.io together
```

Then open `http://localhost:3000`.

---

## Environment variables

```env
MONGODB_URI=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

---

## Project structure

```
DraftSpace/
│
├── app/                          ⚡  Next.js 14 App Router
│   ├── (canvas)/                    Public canvas route — no auth
│   ├── dashboard/                   Board management (auth-gated)
│   └── api/
│       ├── ai/                      Text + code via Anthropic Claude
│       ├── image/                   Image generation via Gemini
│       ├── canvas/                  Board CRUD (save, load, delete)
│       └── auth/                    NextAuth.js handlers
│
├── components/                   🧩  Shared UI components
│   ├── Canvas.tsx                   Excalidraw wrapper (dynamic import)
│   ├── CommandInput.tsx             AI command input + slash popover
│   ├── AIResultCard.tsx             Renders AI responses on canvas
│   └── SaveStatus.tsx               Auto-save indicator in navbar
│
├── lib/
│   ├── api/
│   │   ├── ai-shared.ts             Rate limiter, CORS headers, utils
│   │   └── image-config.ts          Image size + aspect ratio config
│   ├── hooks/
│   │   ├── useAICommand.ts          Sends commands, handles responses
│   │   └── useBoardSync.ts          Debounced auto-save hook
│   └── models/                      Mongoose schemas (User, Canvas)
│
├── server.js                     🔌  Custom Node server — Next.js + Socket.io
├── middleware.ts                     Auth protection for dashboard routes
└── render.yaml                   ☁️  Railway deployment config
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 with App Router |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Canvas | @excalidraw/excalidraw (npm package, not a fork) |
| AI — text / code | Anthropic Claude API |
| AI — images | Google Gemini 2.0 Flash image generation |
| Auth | NextAuth.js v4 + Google OAuth |
| Database | MongoDB Atlas + Mongoose |
| Real-time | Socket.io 4.x via custom server.js |
| State | Zustand |
| Deployment | Railway (Node.js — Socket.io compatible) |

---

<div align="center">

Built by **Utkarsh**

*If it was useful or interesting, a star is always appreciated.*

[![Star on GitHub](https://img.shields.io/github/stars/yourusername/draftspace?style=social)](https://github.com/yourusername/draftspace)

</div>