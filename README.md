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

![AI](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)
![AI](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)
![Next JS](https://img.shields.io/badge/next%20js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![NPM](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![ShadCN](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![DATABASE](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

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

[**VIEW ON GITHUB →**](https://github.com/yourusername/draftspace) &nbsp;&nbsp; [**REPORT A BUG →**](https://github.com/yourusername/draftspace/issues)

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
coming soon.........
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
└── middleware.ts                     Auth protection for dashboard routes
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
| Deployment | coming soon |

---

<div align="center">
<img src="https://github.com/utkarshsoni1.png" width="52" height="52" style="border-radius:50%;" alt="Utkarsh Soni" />
  
Built by **[Utkarsh Soni](https://github.com/UtkarshSoni1)**

*If you found this helpful or cool, feel free to drop a star ⭐*

[![Star on GitHub](https://img.shields.io/github/stars/utkarshsoni1/draftspace?style=for-the-badge&color=0f0f0f&labelColor=f0f0f0&label=★%20Star%20on%20GitHub)](https://github.com/utkarshsoni1/draftspace)

</div>
