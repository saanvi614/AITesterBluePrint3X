# Task Plan — Test Strategy Buddy

## Project Goal
Build a lightweight React application that streamlines JIRA-driven test planning workflow end-to-end for the SUT: https://courses.thetestingacademy.com/

## Phases & Checklist

### Phase 0: Initialization
- [x] Create task_plan.md
- [x] Create findings.md
- [x] Create progress.md
- [x] Initialize LLM.md
- [x] Discovery Questions answered by user
- [x] Data Schema confirmed in LLM.md
- [x] Blueprint approved ✓

### Phase 1: Blueprint
- [x] North Star confirmed
- [x] Integrations confirmed (JIRA + GROQ keys in .env; Project Key: SCRUM; Settings screen for production)
- [x] Source of Truth confirmed (SUT fetched at runtime → GROQ; JIRA is write destination)
- [x] Delivery Payload confirmed (Option 3: JIRA write-back + UI display; Test Strategy → .docx download; Test Cases → .csv download; GitHub: saanvi614/AITesterBluePrint3X → Vercel)
- [x] Behavioral Rules confirmed (Formal & Technical tone; open-ended child items; Anti-Hallucination Rules as-is)

### Phase 2: Link
- [x] tools/ directory created (Layer 3 per B.L.A.S.T. framework)
- [x] tools/verify_jira.js written — tests Auth, SCRUM project access, issue types (3 tests)
- [x] tools/verify_groq.js written — tests API key, lists models, runs minimal chat completion (2 tests)
- [x] tools/README.md written with run instructions
- [ ] User must run: `node tools/verify_jira.js` — confirm PASS before use
- [ ] User must run: `node tools/verify_groq.js` — confirm PASS before use

### Phase 3: Architect
- [x] Layer 1 SOPs written (architecture/) — SOP_01 to SOP_06
- [x] Layer 2 Navigation logic defined (App.jsx routes + AppContext guards)
- [x] Layer 3 Tools written (tools/ — verify_jira.js, verify_groq.js) + services/ (jiraService, groqService, sutService, exportService)

### Phase 4: Stylize
- [x] Dark/Light mode implemented (CSS variables + data-theme toggle)
- [ ] UI layouts reviewed by user (pending local run)

### Phase 5: Trigger
- [x] npm install completed
- [x] Build verified (vite build — 52 modules, clean)
- [x] Deployed to Vercel: https://test-strategy-buddy-seven.vercel.app
- [ ] Deployed to GitHub (saanvi614/AITesterBluePrint3X) — pending user push
- [ ] Maintenance Log finalized in LLM.md

## Notes
> Awaiting Discovery Question answers before any code is written.