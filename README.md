# StartupIQ

**AI-Powered Startup Idea Validation and Business Analysis Platform**

> Validate Your Startup Idea. Understand Your Market. Build Smarter.

StartupIQ turns a startup idea into a structured, AI-assisted validation report: SWOT analysis,
TAM/SAM/SOM market sizing, a full Business Model Canvas, competitor analysis, revenue model
recommendations, investor feedback, risk assessment, and an overall 0–100 StartupIQ Score —
downloadable as a professional PDF.

**Important:** StartupIQ provides *preliminary AI-assisted decision-support analysis*. It does not
guarantee commercial success and is not financial, investment, or legal advice.

---

## 1. Features

**User**
- Register / login (JWT + bcrypt), profile management, password change, account deletion
- Multi-step startup idea submission (with optional PDF pitch deck upload)
- Full Validation / Market / Business / Investor analysis types
- AI-generated (or clearly-labeled DEMO MODE) structured report: executive summary, SWOT,
  TAM/SAM/SOM, Business Model Canvas, competitor table, revenue models, investor feedback,
  market analysis, risk table, prioritized recommendations, and a server-validated score
- Dashboard with real charts (validation trend, industry distribution, score distribution)
- History with search / filter / sort / pagination
- PDF report download, report sharing via secure random tokens, report deletion

**Admin**
- User management (view, disable/enable, delete)
- Report management (view, delete)
- Platform analytics (users, reports, average score, top industries, failed AI requests)
- System activity log
- AI prompt template management (edit / restore default — content is always used as plain text,
  never executed as code)

**Engineering**
- Provider-agnostic AI service (`server/services/aiService.js`) — Gemini by default, swappable
- Server-side score validation/clamping (never trusts the AI's arithmetic)
- Strict JSON schema enforcement with one automatic repair attempt on malformed AI output
- **DEMO MODE**: if no `GEMINI_API_KEY` is set, the app still runs end-to-end using a clearly
  labeled, deterministic demo analysis derived from your own input — never mixed with real
  AI output
- IDOR protection (report/startup ownership checked server-side on every request)
- Rate limiting, Helmet, CORS, input validation (Zod) on every mutating endpoint
- Full activity logging (login, validation lifecycle, report actions, admin actions)

---

## 2. Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Recharts, Framer Motion, lucide-react |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) — local or MongoDB Atlas |
| AI | Gemini API (provider-abstracted; OpenAI or others can be added in `aiService.js`) |
| Auth | JWT + bcryptjs |
| PDF | PDFKit |
| Validation | Zod |
| Testing | Jest + Supertest (backend), Vitest + Testing Library (frontend) |

---

## 3. Folder structure

```text
startupiq/
├── client/                 # React + Vite frontend
│   └── src/
│       ├── components/     # Reusable UI (Button, Card, ScoreGauge, Sidebar, ...)
│       ├── pages/           # Route pages, incl. pages/admin/*
│       ├── layouts/         # PublicLayout, DashboardLayout
│       ├── context/         # AuthContext
│       ├── services/        # axios API client
│       └── constants/       # shared form option lists
├── server/                 # Express backend
│   ├── controllers/        # auth, startup, analysis, report, admin
│   ├── models/              # User, StartupIdea, Report, PromptTemplate, ActivityLog
│   ├── routes/               # REST route definitions
│   ├── middleware/           # auth, error handling, rate limiting
│   ├── services/              # aiService, demoAnalysis, scoreService, pdfService, activityService
│   ├── validators/            # Zod schemas
│   ├── seed/                   # dev seed script (admin + demo reports)
│   └── tests/                   # Jest/Supertest tests
├── README.md
└── package.json             # root scripts (installs/runs both apps)
```

---

## 4. Installation

Prerequisites: Node.js 18+, npm, and a MongoDB instance (local `mongod` or a free MongoDB Atlas
cluster).

```bash
git clone <this-repo>
cd startupiq
npm run install:all
```

This installs dependencies for both `server/` and `client/`.

## 5. Environment variables

Copy the example files and fill them in:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**`server/.env`**

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/startupiq
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

AI_PROVIDER=gemini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-pro

ADMIN_EMAIL=admin@startupiq.local
ADMIN_PASSWORD=          # set this before running `npm run seed`

MAX_UPLOAD_MB=10
ANALYSIS_RATE_LIMIT_PER_HOUR=10
```

**`client/.env`**

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 6. MongoDB setup

- **Local**: install MongoDB Community Server and run `mongod`; the default `MONGODB_URI` above
  will work as-is.
- **Atlas**: create a free cluster at mongodb.com/atlas, create a database user, allow your IP,
  and paste the connection string into `MONGODB_URI` (add a database name, e.g. `/startupiq`,
  before the query string).

## 7. Gemini (AI) setup

1. Get an API key from Google AI Studio (aistudio.google.com).
2. Put it in `server/.env` as `GEMINI_API_KEY`.
3. **Without a key, the app still runs** — analysis requests fall back to a clearly-labeled
   **DEMO MODE** so you can develop/demo the full flow without live AI calls. The report page and
   PDF both surface a visible "DEMO MODE" badge in that case.

To use a different provider (e.g. OpenAI), implement a `callOpenAI(prompt)` function in
`server/services/aiService.js` alongside `callGemini`, and branch on `process.env.AI_PROVIDER` —
nothing else in the codebase needs to change.

## 8. Admin setup

Admin accounts are never created through public registration. Set `ADMIN_EMAIL` and
`ADMIN_PASSWORD` in `server/.env`, then run:

```bash
npm run seed
```

This creates (or confirms) the admin account, the default AI prompt template, and two labeled
demo reports for a sample user (`demo.user@startupiq.local` / `DemoPassword123!`).

## 9. Running the app

From the project root:

```bash
npm run dev
```

This starts the backend on `http://localhost:5000` and the frontend on `http://localhost:5173`
concurrently. Or run them separately:

```bash
npm run dev:server   # backend only
npm run dev:client   # frontend only
```

## 10. Development commands

```bash
npm run install:all   # install both apps' dependencies
npm run dev            # run both apps concurrently
npm run seed            # seed admin + demo data (requires MONGODB_URI + ADMIN_PASSWORD)
npm run test:server      # backend test suite (Jest + Supertest)
npm run test:client       # frontend test suite (Vitest)
npm run build:client       # production build of the React app
```

## 11. Testing performed

**Backend** (`server/tests`, all passing without a live database):
- `scoreService`: dimension clamping, total-never-exceeds-100, missing-input handling, label
  boundaries
- `demoAnalysis`: required sections present, SWOT has ≥3 points per category, market-size values
  are labeled as estimates (never "verified"), deterministic output, score passes through
  `computeScore` within bounds
- `validators`: rejects mismatched passwords / invalid email / too-short problem statements;
  accepts valid payloads
- Live Express app via Supertest: `/api/health` is public and returns 200; protected routes
  reject missing/garbage JWTs with 401 *before* touching the database; unknown routes return a
  consistent 404 JSON shape

**Manually verified live, in this environment:**
- Full production build of the React app (`vite build`) completes with zero errors
- The Express server actually **boots** and serves live HTTP traffic, including graceful (non-crashing)
  `503 DATABASE_UNAVAILABLE` responses when MongoDB is unreachable, and correct Zod validation
  errors on bad input
- `pdfService.js` generates a real, valid multi-page PDF from a full demo report

**Not runnable in this sandboxed build environment** (no internet access beyond package
registries, no local MongoDB): full CRUD flows against a live database, a live Gemini API call,
and the frontend's live network calls against a running backend. Run `npm run dev` on your own
machine with `MONGODB_URI` set to test these end-to-end — the code paths for all of them are
implemented and were reviewed/tested as far as this environment allows.

## 12. API overview

All endpoints are prefixed with `/api`. See `server/routes/*.js` for the full list. Responses
follow a consistent shape: `{ "success": true, "data": {...} }` or
`{ "success": false, "message": "...", "code": "..." }`.

| Area | Routes |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`, `PUT /auth/profile`, `PUT /auth/password`, `DELETE /auth/account` |
| Startups | `POST/GET /startups`, `GET/PUT/DELETE /startups/:id` |
| Analysis | `POST /analysis` (runs AI validation), `GET /analysis`, `GET/DELETE /analysis/:id` |
| Reports | `GET /reports`, `GET /reports/:id`, `GET /reports/:id/pdf`, `PUT /reports/:id/share`, `DELETE /reports/:id`, `GET /reports/shared/:token` |
| Admin | `/admin/users`, `/admin/reports`, `/admin/analytics`, `/admin/activity`, `/admin/prompts` |

## 13. Troubleshooting

- **"AI service is not configured" / DEMO MODE badge everywhere**: set `GEMINI_API_KEY` in
  `server/.env` and restart the server.
- **`DATABASE_UNAVAILABLE` errors**: confirm `mongod` is running (or your Atlas IP allowlist /
  connection string is correct).
- **CORS errors in the browser**: make sure `CLIENT_URL` in `server/.env` matches the URL the
  frontend is actually served from.
- **401 on every request after login**: check that `JWT_SECRET` hasn't changed since the token
  was issued (changing it invalidates all existing tokens).

## 14. Deployment

- **Backend**: deploy `server/` to any Node host (Render, Railway, Fly.io, a VM, etc.). Set all
  environment variables from `server/.env.example` in the host's dashboard — never commit `.env`.
- **Frontend**: `npm run build --prefix client` produces a static `client/dist` bundle deployable
  to Vercel, Netlify, or any static host. Set `VITE_API_BASE_URL` to your deployed backend's URL
  at build time.
- **Database**: use MongoDB Atlas for production.
- Ensure `MAINTENANCE_MODE=true` can be toggled via environment variable if you need to take the
  API down for maintenance without a redeploy.

## 15. Known limitations

- Report sharing exposes a read-only report via a random token; there's no expiry/rotation UI yet.
- The admin "System Settings" page described in the original spec (AI provider/model, max upload
  size, rate limit, maintenance mode as live-editable UI) is currently configured via environment
  variables rather than an in-app settings screen, to avoid exposing secrets through the UI layer.
- File storage for pitch decks is local disk by default (`server/uploads/pitchdecks`); swap in a
  cloud storage adapter in `server/routes/startup.routes.js` for production use behind a load
  balancer with multiple instances.
