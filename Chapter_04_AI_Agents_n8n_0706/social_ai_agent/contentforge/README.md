# ContentForge

> Automated AI content-generation pipeline with a live web dashboard.
> Runs 100% locally — no cloud services except Groq (text) and Gemini (images).

**Course:** AI Tester Blueprint 3X — Chapter 04: AI Agents with n8n
**Local:** http://localhost:3030
**Live (Vercel):** https://swati-content-creation.vercel.app

> **Vercel note:** The daily cron scheduler and Excel file writes require a persistent Node.js process. On Vercel (serverless), the scheduler does not fire automatically and Excel writes go to `/tmp` (ephemeral). Use **Run Pipeline Now** button manually, or self-host for full automation.

---

## What it does

Every day at **09:00 AM local time**, ContentForge auto-generates a full week's worth of platform-ready content for one AI/QA topic:

| Output | Platform | Tool | Length |
|--------|----------|------|--------|
| LinkedIn post | LinkedIn | Groq | ~150–200 words |
| Article | Medium | Groq | ~3000 words (Markdown) |
| Reel/Carousel script | Instagram | Groq | 7–10 slides + caption |
| Video script | YouTube | Groq | 8–12 min (with timestamps) |
| Technical article | Dev.to | Groq | ~2000 words (Markdown) |
| Cover image | Medium | Gemini | 16:9 |
| Banner image | LinkedIn | Gemini | 1200×627 |
| Square image | Instagram | Gemini | 1080×1080 |

All output is saved to a local Excel file (`content_calendar.xlsx`) and viewable live in the dashboard.

---

## Prerequisites

- Node.js 20 or higher — check with `node -v`
- A Groq API key (free tier works): https://console.groq.com/keys
- A Google Gemini API key (free tier works): https://aistudio.google.com/app/apikey

---

## Quick Start (3 steps)

### Step 1 — Install

```bash
cd contentforge
npm install
```

### Step 2 — Add API keys

```bash
# Windows
copy .env.example .env.local

# Mac / Linux
cp .env.example .env.local
```

Open `.env.local` and paste your **real** keys (never use `.env.example` for real keys):

```env
GROQ_API_KEY=gsk_YOUR_REAL_KEY_HERE
GEMINI_API_KEY=AIzaSy_YOUR_REAL_KEY_HERE
```

### Step 3 — Run

```bash
npm run dev
```

Open **http://localhost:3030** in your browser.

---

## Project Structure

```
contentforge/
│
├── lib/                        # All backend logic (pure TypeScript)
│   ├── types.ts                # ContentRow interface, PipelineState, enums
│   ├── excelManager.ts         # ExcelManager class — all Excel reads/writes (with mutex)
│   ├── agents.ts               # Agent 1, 2, 3 + API key health check
│   ├── pipeline.ts             # runPipeline() orchestrator + in-memory state
│   └── scheduler.ts            # node-cron daily trigger + key health polling
│
├── app/                        # Next.js 14 App Router
│   ├── layout.tsx              # Root layout (dark theme, Tailwind)
│   ├── page.tsx                # Dashboard — polls APIs every 4 s
│   ├── globals.css             # Tailwind base + custom scrollbar
│   └── api/
│       ├── run/route.ts        # POST  /api/run      → trigger pipeline
│       ├── status/route.ts     # GET   /api/status   → pipeline state + key health
│       ├── today/route.ts      # GET   /api/today    → today's content row
│       ├── calendar/route.ts   # GET   /api/calendar → all rows, newest first
│       └── download/route.ts   # GET   /api/download → stream .xlsx file
│
├── components/
│   ├── StatusCards.tsx         # API key badges, pipeline step, row count
│   ├── ContentTabs.tsx         # 6-tab view (LinkedIn/Medium/IG/YT/Dev.to/Images)
│   ├── CalendarTable.tsx       # Full spreadsheet as color-coded table
│   └── ExcelLog.tsx            # Write-activity log + xlsx download button
│
├── public/images/              # Generated images (served by Next.js at /images/*)
├── instrumentation.ts          # Next.js hook — starts scheduler once on boot
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json               # strict mode, no `any`
├── package.json
├── .env.example                # Key template — copy to .env.local
└── content_calendar.xlsx       # Created automatically on first pipeline run
```

---

## The Four Agents

### Agent 1 — Topic Generator
- Runs daily at 09:00 AM (also on manual trigger).
- Calls Groq (`llama-3.3-70b-versatile`) to pick one fresh topic from the keyword pool:
  `QA`, `MCP`, `RAG`, `LLM`, `AI Agents`, `n8n`, `LangFlow`, `Crew AI`, `DeepEval`, `LangChain`, `AI Harness`, `LLM Eval`
- Checks existing topics in the sheet and avoids repeats.
- Appends a new row: today's date, the topic, `Status = Pending`.
- If a row for today already exists, skips the append.

### Agent 2 — Content Writer (Groq)
- Reads today's row.
- Fires all **5 content prompts in parallel** (`Promise.all`) for speed.
- Voice: direct, technical, short paragraphs, no filler phrases.
- Sets `Status = Imaging` when done.

### Agent 3 — Image Generator (Gemini)
- Calls `gemini-2.0-flash-preview-image-generation` via `@google/genai`.
- Generates 3 images (Medium 16:9, LinkedIn 1200×627, Instagram 1080×1080).
- Saves PNG files to `public/images/` as `<type>_YYYY-MM-DD.png`.
- Stores relative paths (e.g. `/images/medium_2026-06-24.png`) in the Excel row.
- Sets `Status = Done` on success, `Status = Error` if all three fail.
- Individual image failures are logged but do not block the others.

### Agent 4 — Sheet Updater (integrated)
- Not a standalone agent — every agent writes directly to Excel through `ExcelManager`.
- `ExcelManager` uses a **Promise-based mutex** so concurrent writes are serialized and the file is never corrupted.
- Pattern: read workbook → mutate row → write file — atomic per operation.

---

## Pipeline Orchestration

```
runPipeline()
  └── Agent 1 (topic)
        └── Agent 2 (write 5 pieces in parallel)
              └── Agent 3 (generate 3 images)
```

- `runPipeline()` is guarded: if already running, a second call is a no-op.
- Status field in Excel updates after each agent: `Pending → Writing → Imaging → Done / Error`.
- On any error: logs the message, sets `Status = Error`, keeps the row intact.
- The `instrumentation.ts` hook (Next.js 14 feature) initializes the scheduler **exactly once** in the Node.js runtime — not inside React render code.

---

## Dashboard

URL: **http://localhost:3030**

### Header bar
| Element | What it does |
|---------|-------------|
| **Run Pipeline Now** | Fires `POST /api/run`, returns immediately; progress is visible live |
| Spinner | Shows while pipeline is running |
| Step label | Shows current agent step (e.g. "Agent2: Writing content") |

### Status cards (auto-refresh every 4 s)
| Card | Data source |
|------|------------|
| API Keys (Groq / Gemini) | Green = key present + reachable; Red = missing or auth error |
| Next scheduled run | Next 09:00 AM in local time |
| Today's Topic | From today's Excel row |
| Status chip | Color-coded: yellow=Pending, blue=Writing, purple=Imaging, green=Done, red=Error |
| Pipeline | Current step or "Idle" |
| Total rows | Count of rows in the Excel file |

### Main tabs

**Today's Content**
- Six sub-tabs: LinkedIn, Medium, Instagram, YouTube, Dev.to, Images.
- LinkedIn / IG / YouTube render as plain pre-formatted text with a **Copy** button.
- Medium / Dev.to render as **Markdown** (react-markdown) with a **Copy** button.
- Images tab shows all three generated images inline.

**Calendar**
- Full `content_calendar.xlsx` as a sortable table, newest row first.
- Status column is color-coded.
- Columns: Date, Topic, Status, Content (5 pieces?), Images (3?), Last Updated, Updated By.

**Excel Log**
- Shows every row sorted by last write time.
- Each entry shows: which agent wrote it, what was written (topic, content pieces, images).
- File metadata: row count, last modified timestamp.
- **Download .xlsx** button streams the file directly from `/api/download`.

---

## API Reference

All routes are served on http://localhost:3030.

| Method | Route | Response |
|--------|-------|----------|
| `POST` | `/api/run` | `{ started: true }` or `{ error: "already running" }` (409) |
| `GET` | `/api/status` | `PipelineState` + `rowCount` + `lastModified` |
| `GET` | `/api/today` | `{ row: ContentRow \| null, date: "YYYY-MM-DD" }` |
| `GET` | `/api/calendar` | `{ rows: ContentRow[] }` sorted newest first |
| `GET` | `/api/download` | Binary `.xlsx` file download |

### ContentRow shape

```typescript
interface ContentRow {
  date:          string;        // "YYYY-MM-DD"
  topic:         string;
  linkedinPost:  string;
  mediumArticle: string;        // Markdown
  igScript:      string;
  ytScript:      string;
  devtoArticle:  string;        // Markdown
  status:        "Pending" | "Writing" | "Imaging" | "Done" | "Error";
  linkedinImage: string;        // "/images/linkedin_2026-06-24.png"
  mediumImage:   string;
  igImage:       string;
  lastUpdated:   string;        // ISO timestamp
  updatedBy:     string;        // "Agent1" | "Agent2" | "Agent3"
  errorMessage:  string;
}
```

---

## Excel File

**Location:** `contentforge/content_calendar.xlsx` (project root)

Created automatically on the first pipeline run. Columns:

| Col | Header | Written by |
|-----|--------|-----------|
| A | Date | Agent 1 |
| B | Topic | Agent 1 |
| C | LinkedIn POST | Agent 2 |
| D | Medium Article | Agent 2 |
| E | IG Script | Agent 2 |
| F | YT Script | Agent 2 |
| G | Dev.to Article | Agent 2 |
| H | Status | All agents |
| I | LinkedIn Image | Agent 3 |
| J | Medium Image | Agent 3 |
| K | IG Image | Agent 3 |
| L | Last Updated | All agents (auto) |
| M | Updated By | All agents (auto) |
| N | Error Message | Agent 3 (on failure) |

---

## Generated Images

**Location:** `contentforge/public/images/`

Naming convention: `<type>_YYYY-MM-DD.png`

```
public/images/
  medium_2026-06-24.png       ← served at /images/medium_2026-06-24.png
  linkedin_2026-06-24.png
  ig_2026-06-24.png
```

Next.js serves the `public/` directory statically, so images are available immediately at their `/images/*` paths.

---

## Security

| File | Commit? | Purpose |
|------|---------|---------|
| `.env.local` | **NO** | Your real API keys |
| `.env` | **NO** | Alternative local override — also excluded |
| `.env.example` | YES | Placeholder template (no real keys) |

`.gitignore` excludes `.env` and `.env.local` automatically.
**Never paste real API keys into `.env.example`** — that file is tracked by git.

---

## Environment Variables

File: `.env.local` (in project root, **never commit this file**)

```env
GROQ_API_KEY=gsk_...       # From https://console.groq.com/keys
GEMINI_API_KEY=AIzaSy...   # From https://aistudio.google.com/app/apikey
```

`.env.local` is loaded by Next.js automatically — no `dotenv` import needed in route handlers.

---

## Models Used

| Agent | Provider | Model | Purpose |
|-------|----------|-------|---------|
| Agent 1 | Groq | `llama-3.3-70b-versatile` | Topic generation |
| Agent 2 | Groq | `llama-3.3-70b-versatile` | All 5 content pieces |
| Agent 3 | Gemini | `gemini-2.0-flash-preview-image-generation` | 3 platform images |
| Key health | Gemini | `gemini-2.0-flash` | Ping test only |

---

## Scheduling

- **Daily trigger:** 09:00 AM local machine time (node-cron: `0 9 * * *`)
- **API key health check:** every 10 minutes
- The scheduler boots inside `instrumentation.ts` via Next.js 14's instrumentation hook — this runs in the Node.js runtime before any request, exactly once per server process.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 14.x |
| UI | React | 18.x |
| Styling | Tailwind CSS | 3.x |
| Language | TypeScript (strict) | 5.x |
| LLM (text) | groq-sdk | 0.7.x |
| LLM (images) | @google/genai | 0.14.x |
| Excel | exceljs | 4.x |
| Scheduler | node-cron | 3.x |
| Markdown render | react-markdown | 9.x |

---

## Troubleshooting

**Pipeline starts but content is empty**
- Check the terminal for `[Agent2]` errors — usually a Groq rate limit or token overage.
- Groq free tier: 6000 tokens/min. Agent 2 fires 5 prompts in parallel; if you hit the limit, add a small delay between calls in `agents.ts`.

**Images not appearing**
- Gemini image generation uses a preview model — it may return text instead of an image on some prompts. Check terminal for `[Agent3] No image data in response`.
- Status will still be `Done` if at least one image succeeded.

**Port 3030 already in use**
- Kill the process: `npx kill-port 3030` or change the port in `package.json` (`--port XXXX`).

**Excel file locked / write error**
- Only one process should open the Excel file at a time. Close it in Excel before running the pipeline.

**`GROQ_API_KEY not set` error**
- Make sure the file is named exactly `.env.local` (not `.env` or `env.local`) and is in the `contentforge/` root.

---

## Development Commands

```bash
npm run dev          # Start dev server on http://localhost:3030 (hot reload)
npm run build        # Production build
npm run start        # Run production build on http://localhost:3030
npm run type-check   # TypeScript strict check (no compile output)
```
