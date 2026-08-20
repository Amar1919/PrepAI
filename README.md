# PrepAI

[![CI](https://github.com/YOUR_USERNAME/PrepAI/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/PrepAI/actions/workflows/ci.yml)

An AI-powered interview and career prep platform for students — mock interviews, resume analysis,
DSA practice, and company-specific question banks, all backed by Google Gemini.

> Replace `YOUR_USERNAME` in the badge URL above with your actual GitHub username once pushed —
> it'll turn green automatically after your first CI run.

## What's in this rebuild

This is a modernized version of the original PrepAI codebase. Highlights:

- **Dark SaaS UI** — full Tailwind redesign (Login, Signup, Dashboard, and every feature page)
- **Fixed real bugs** — missing `jsonwebtoken` dependency, unauthenticated routes that leaked
  every user's interview/resume data, no per-user data isolation
- **Security hardening** — helmet, rate limiting, input validation, centralized error handling,
  file-type/size limits on uploads
- **New features**:
  - 🔥 Streaks, XP, and unlockable badges
  - 🎙️ Voice-based mock interviews (Web Speech API — speech-to-text + text-to-speech)
  - 🧩 DSA practice module with AI code review (22 seeded problems, real LeetCode links)
  - 🏢 Company-specific question banks (Google, Amazon, Microsoft, Meta, Netflix, startups)
  - 💬 AI Assistant chat (ChatGPT-style) — streaming responses, multiple saved conversations,
    scoped to help with interview/career/DSA questions but able to chat generally too
  - 👤 Editable profile with target role
  - 🌐 Public landing page (no login wall before you know what the app does)
  - 🛡️ React error boundary + proper 404 page
  - 🧠 Real syntax-highlighted code editor (CodeMirror) with 4 languages, plus "View on
    LeetCode ↗" links on problems that have a real LeetCode equivalent
  - 🧠 Real syntax-highlighted code editor (CodeMirror) with 4 languages, plus "View on
    LeetCode ↗" links on problems that have a real LeetCode equivalent
- **Tested** — Jest + Supertest backend test suite (auth, protected routes, gamification logic)
  running against an in-memory MongoDB, wired into GitHub Actions CI on every push
- **Deployable** — Docker, docker-compose, Vercel config (frontend), Render blueprint (backend)

## Project structure

```
PrepAI/
├── backend/                       Express 5 + MongoDB + Gemini API
│   ├── src/
│   │   ├── app.js                 Pure Express app (testable, no listen/DB connect)
│   │   ├── server.js              Boots app.js: connects DB, starts listening
│   │   ├── config/db.js
│   │   ├── modules/                One folder per feature - controller + routes + model together
│   │   │   ├── auth/
│   │   │   ├── user/
│   │   │   ├── interview/
│   │   │   ├── resume/
│   │   │   ├── dsa/                Includes dsaProblems.data.json (22 seeded problems)
│   │   │   ├── company/            Includes companies.data.json
│   │   │   ├── chat/                AI Assistant - streaming chat, conversation history
│   │   │   └── ai/                 Gemini wrapper, shared by other modules
│   │   ├── shared/
│   │   │   ├── middleware/         Auth, validation, error handling, uploads
│   │   │   └── utils/              ApiError, asyncHandler, gamification
│   │   └── tests/                  Jest + Supertest
│   ├── Dockerfile
│   └── render.yaml
├── frontend/                      React 19 + Vite + Tailwind
│   ├── src/
│   │   ├── features/                One folder per feature - pages + components + service calls together
│   │   │   ├── auth/                 Login, Signup, authService.js
│   │   │   ├── dashboard/
│   │   │   ├── interviews/           Generator, History, Practice + interviewService.js
│   │   │   ├── resume/               Analyzer, History + resumeService.js
│   │   │   ├── mockInterview/        Voice-based practice (reuses interviewService)
│   │   │   ├── dsa/                  CodeMirror editor, problem filters + dsaService.js
│   │   │   ├── companies/
│   │   │   ├── profile/
│   │   │   ├── chat/                  AI Assistant with streaming replies
│   │   │   └── landing/              Public marketing page + 404
│   │   └── shared/
│   │       ├── components/          Layout, Sidebar, Topbar, ErrorBoundary, EmptyState, etc.
│   │       ├── context/              Auth + Toast providers
│   │       └── services/api.js       Base axios instance with interceptors
│   └── vercel.json
└── docker-compose.yml              Full local stack (Mongo + backend)
```

Each backend module and frontend feature owns everything specific to it. Nothing outside a
module/feature ever imports from inside another one directly except through its public service
file (e.g. `mockInterview` reuses `interviews/services/interviewService.js` rather than
duplicating the evaluate-answer call) — that keeps features loosely coupled and easy to
find/delete/extend independently.

## Local development

### 1. Backend

```bash
cd backend
cp .env.example .env      # fill in MONGO_URI, JWT_SECRET, GEMINI_API_KEY
npm install
npm run dev                # nodemon, http://localhost:5000
```

You'll need a MongoDB instance — either install it locally, use `docker-compose up mongo`,
or use a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

Get a Gemini API key at https://aistudio.google.com/app/apikey.

### 2. Frontend

```bash
cd frontend
cp .env.example .env      # VITE_API_URL, defaults to http://localhost:5000/api
npm install
npm run dev                # http://localhost:5173
```

### 3. Or run everything with Docker

```bash
export JWT_SECRET=your_long_random_secret
export GEMINI_API_KEY=your_gemini_key
docker-compose up --build
```

This starts MongoDB + the backend API on port 5000. Run the frontend separately with
`npm run dev` (or add a frontend service to `docker-compose.yml` if you want it containerized too).

## Deployment

### Backend → Render (or Railway)

1. Push this repo to GitHub.
2. On Render, "New +" → "Blueprint" → point at this repo (it will pick up `backend/render.yaml`),
   **or** manually create a Web Service with root directory `backend`, build command `npm install`,
   start command `node src/server.js`.
3. Set environment variables: `MONGO_URI` (Atlas connection string), `JWT_SECRET`, `GEMINI_API_KEY`,
   `CLIENT_URL` (your deployed frontend URL, for CORS).

### Frontend → Vercel

1. Import the repo in Vercel, set root directory to `frontend`.
2. Build command `npm run build`, output directory `dist` (Vercel auto-detects Vite).
3. Set environment variable `VITE_API_URL` to your deployed backend's `/api` URL,
   e.g. `https://prepai-backend.onrender.com/api`.

Once both are deployed, update the backend's `CLIENT_URL` env var to the final Vercel URL
and redeploy so CORS allows requests from it.

## Running tests

```bash
cd backend
npm test
```

Uses an in-memory MongoDB (`mongodb-memory-server`), so no real database is needed to run the
suite — nothing touches your actual data. The first run downloads a small MongoDB binary
(cached afterward). CI runs this automatically on every push via `.github/workflows/ci.yml`.

## Notes & limitations

- **DSA code review, not code execution.** Submitted code isn't run in a sandbox — it's
  reviewed by Gemini for correctness, complexity, and edge cases. This is intentional: running
  arbitrary user-submitted code safely requires a proper container/sandbox infrastructure that's
  out of scope here, but AI code review still gives real, useful feedback for interview prep.
- **Voice mock interview** uses the browser's native Web Speech API, which is best supported in
  Chrome/Edge on desktop. Other browsers fall back to typed answers automatically.
- Free tiers of Render/Railway spin down on inactivity, so the first request after idle time
  will be slow (~30–60s) — this is a platform limitation, not an app bug.
