# 🔍 Flaky Test Analyzer UI

> Powered by LangFlow · @created by SwatiJ

A lightweight React + Vite front-end for a LangFlow AI agent that compares two Playwright test runs and identifies flaky, consistently failing, and passing tests.

---

## Live Demo — Sample Output

The agent produces a structured **Test Reliability Analysis Report** with four sections:

| Section | What it shows |
|---|---|
| **1. Flaky Tests** | Tests that passed in one build and failed in another, with likely root cause |
| **2. Consistent Failures** | Tests failing across both builds with backend/data root cause analysis |
| **3. Rerun Recommendation** | Per-test action: RERUN (flaky), SEND TO ENGINEERING (bug) |
| **4. Summary Table** | Side-by-side Build A vs Build B — Total / Passed / Failed / Flaky / Duration |

Example summary from a real run:

| Metric        | Build 1 | Build 2 |
|---------------|---------|---------|
| Total Tests   | 50      | 50      |
| Passed        | 47      | 48      |
| Failed        | 3       | 2       |
| Flaky         | 1       | —       |
| Duration      | 41.7s   | 39.5s   |

---

## What it does

1. Drop two Playwright `results.json` files — **Build A** vs **Build B** — onto the upload cards.
2. Each file is parsed locally in the browser. You instantly see per-build stats:
   - Passed / Failed / Flaky / Skipped / Duration
3. Click **▶ Run Analysis**. The app:
   - Uploads both files to LangFlow (`POST /api/v1/files/upload/{flowId}`)
   - Runs the flow (`POST /api/v1/run/{flowId}`)
   - Renders the agent's report as clean markdown (tables, lists, code blocks)
4. Copy or download the report as a `.md` file.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite 5 |
| Styling | Plain CSS (no UI framework), CSS custom properties |
| Markdown | `react-markdown` + `remark-gfm` |
| State | React `useState` / `useEffect` |
| Persistence | `localStorage` (theme + connection settings) |
| Backend | LangFlow (direct API, no custom server) |

---

## Run Locally

```bash
cd flaky_test_analyzer_ai_agent/ui

# 1. Install dependencies (first time only)
npm install

# 2. (Optional) configure environment
cp .env.example .env
# edit .env — set LANGFLOW_URL and/or VITE_API_KEY

# 3. Start dev server
npm run dev
# → http://localhost:5173
```

### Environment variables (`.env` — never committed)

| Variable       | Default                 | Purpose                              |
|----------------|-------------------------|--------------------------------------|
| `LANGFLOW_URL` | `http://localhost:7860` | LangFlow server the Vite proxy hits  |
| `VITE_API_KEY` | _(blank)_               | Pre-seeds the API key field on load  |

---

## UI Features

| Feature | Detail |
|---|---|
| Drag-and-drop upload | Drop `.json` files or click to browse; shows per-file stats instantly |
| Build A vs Build B | Side-by-side cards with a VS divider |
| Run Analysis button | Disabled until both files are loaded; shows live progress steps |
| Markdown report | Tables, lists, code blocks rendered via `react-markdown` |
| Copy / Download | Copy report to clipboard or save as `.md` |
| Dark / Light theme | Toggle in the header; preference saved to `localStorage` |
| Connection settings | Collapsible ⚙ panel — edit base URL, API key, Flow ID, component IDs, prompt, session ID |
| Clear All & Reload | Red button in Connection panel — wipes stale localStorage and reloads clean |
| Error surface | LangFlow error details shown inline, not just "Failed to fetch" |

---

## CORS / Proxy

LangFlow's file-upload endpoint rejects browser CORS preflights (`OPTIONS → 422`).
The Vite dev server proxies all `/api/*` requests to LangFlow as same-origin calls — no preflight is ever sent.

```
Browser → /api/v1/... → Vite proxy → http://localhost:7860/api/v1/...
```

> **Important:** Keep **LangFlow Base URL** blank in the Connection panel.  
> A non-empty Base URL bypasses the proxy → browser hits LangFlow directly → CORS error.  
> If you ever get a CORS error, open ⚙ Connection → **🗑 Clear All & Reload**.

For **production**, configure your reverse proxy (nginx / Caddy) to forward `/api` to LangFlow the same way.

---

## Default LangFlow Config

| Setting             | Default value                          |
|---------------------|----------------------------------------|
| Flow ID             | `15800861-49e3-4902-8b26-0974dec180af` |
| File component — A  | `File-daKW7`                           |
| File component — B  | `File-IKmcY`                           |
| Session ID          | `flaky-analyzer-session`               |
| Prompt              | _"Analyze these two Playwright runs and tell me which build has the most failing/flaky test."_ |

All values are editable at runtime via the ⚙ Connection panel and persist to `localStorage`.  
The API key is **never** hard-coded — enter it in the panel or set `VITE_API_KEY` in `.env`.

---

## API Flow

```
1. POST /api/v1/files/upload/{flowId}   ← upload Build A  → returns file_path
2. POST /api/v1/files/upload/{flowId}   ← upload Build B  → returns file_path
3. POST /api/v1/run/{flowId}?stream=false
   body: {
     output_type: "chat",
     input_type: "text",
     input_value: <prompt>,
     session_id: <session>,
     tweaks: {
       "File-daKW7": { path: [pathA] },
       "File-IKmcY": { path: [pathB] }
     }
   }
   → outputs[0].outputs[0].results.message.text
```

---

## File Layout

```
ui/
├── index.html
├── vite.config.js          ← /api proxy to LangFlow (port 7860)
├── .env.example
├── .gitignore              ← .env excluded
├── package.json
├── src/
│   ├── main.jsx
│   ├── App.jsx             ← layout, theme toggle, run pipeline
│   ├── App.css             ← all component styles
│   ├── index.css           ← base reset + dark/light CSS variables
│   ├── lib/
│   │   ├── api.js          ← uploadFile() + runFlow() + analyze()
│   │   └── playwright.js   ← parse results.json → stat summary
│   └── components/
│       ├── UploadCard.jsx  ← drag-drop card + stat pills
│       ├── Report.jsx      ← markdown render + copy/download
│       └── Settings.jsx    ← connection settings + Clear All & Reload
└── README.md
```

---

## Production Build

```bash
npm run build   # outputs to dist/
npm run preview # local preview of the built output
```
