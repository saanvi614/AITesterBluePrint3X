# AI Tester Blueprint 3.x

A practical, project-driven curriculum for QA engineers learning to use LLMs as a real testing tool — not a toy.
Each chapter pairs concept material with a hands-on project, a prompt template, and runnable code where applicable.

---

## Table of Contents

- [Chapter 01 — LLM Basics](#chapter-01--llm-basics)
- [Chapter 02 — Prompt Engineering & QA Frameworks](#chapter-02--prompt-engineering--qa-frameworks)
- [Chapter 03 — BLAST Framework & AI Test Planning](#chapter-03--blast-framework--ai-test-planning)
- [Chapter 04 — AI Agents & n8n Workflows](#chapter-04--ai-agents--n8n-workflows)
- [Standalone Projects](#standalone-projects)
- [Running Apps — Localhost Reference](#running-apps--localhost-reference)
- [Tech Stack Overview](#tech-stack-overview)

---

## Chapter 01 — LLM Basics

**Location:** `Chapter01_LLM_Basics_2305/`

Foundational material on how Large Language Models read text and decide what to output. The key idea: a model is not a database lookup — it weighs every token against every other token (attention) and predicts the next one.

**What's here:**
- `attention_is_all_you_need.html` — interactive walkthrough of the original Transformer paper concepts
- `attention_interactive.html` — visualises self-attention so you can see why prompt phrasing changes outputs
- `Notes.md` — short recap notes on token weights and attention

**Why a QA engineer should care:** the model's behaviour is deterministic-ish on a per-token level, but every word you add to a prompt shifts the attention weights. That is why structured prompt frameworks (next chapter) outperform free-form questions.

**Q&A — why this matters for testing:**
- **Q: Why does the same prompt give different test cases each run?** A: Sampling temperature plus floating-point non-determinism in attention. Pin `temperature=0` and set explicit constraints to flatten variance.
- **Q: Why does adding "be thorough" rarely help?** A: Vague tokens add weight without direction. Replace with measurable constraints — "cover boundary, negative, and security cases" steers attention to specific output shape.
- **Q: Do I need to read the original Transformer paper?** A: No — but understanding that the model weighs every token against every other token explains why irrelevant words in your prompt pollute the answer.

---

## Chapter 02 — Prompt Engineering & QA Frameworks

**Location:** `Chapter02_Prompt_Eng_2405/`

Hands-on prompt engineering for QA tasks using the RICE-POT framework, plus working test automation frameworks in Playwright and Selenium.

### Project 01 — Create Test Plan

**Location:** `Chapter02_Prompt_Eng_2405/Project01_Create_TestPlan/`

- Prompt templates for generating structured test plans
- `SauceDemo_TestPlan.md` / `.docx` — example test plan output
- `RICE_POT.md` — RICE POT framework documentation
- `sampleprompt_tp.md` — ready-to-use test plan prompt

**RICE-POT Framework:** Role · Instructions · Context · Examples · Persona · Output · Tone — a structured prompt pattern that produces consistent, auditable QA outputs from any LLM.

### Project 001 — Test Case Generation

**Location:** `Chapter02_Prompt_Eng_2405/Project001_TestCase_gen/`

- `RICE-POT-TestCase-Prompt.md` — prompt template for generating test cases
- Sample output CSVs in `output/`

### Project 02 — Playwright Framework

**Location:** `Chapter02_Prompt_Eng_2405/Project02_PlaywrightFramework/Playwright_1406/`

**Tech:** Playwright · TypeScript · Node.js

```bash
cd Chapter02_Prompt_Eng_2405/Project02_PlaywrightFramework/Playwright_1406
npm install
npm test                    # run all tests (headless)
npm run test:headed         # run with browser visible
npm run test:debug          # step-through debug mode
```

Tests target SauceDemo login scenarios. Reports land in `playwright-report/`.

### Project 03 — Selenium Framework (Java)

**Location:** `Chapter02_Prompt_Eng_2405/Project03_Selenium_Framework/AdvanceSeleniumFramework/`

**Tech:** Selenium 4.25.0 · TestNG 7.10.2 · Maven 3 · Java 11

```bash
cd Chapter02_Prompt_Eng_2405/Project03_Selenium_Framework/AdvanceSeleniumFramework
mvn test
```

**Structure:**
```
src/main/java/com/sf/
├── base/       # BaseClass, WebDriverManager
├── pages/      # Page Object Models
└── utils/      # Utility helpers
src/test/java/com/sf/tests/  # Test cases
```

---

## Chapter 03 — BLAST Framework & AI Test Planning

**Location:** `Chapter03_BLAST_FW_0606/`

Introduces the B.L.A.S.T. methodology for AI-assisted test strategy and ships a working React app that generates full test plans from Jira tickets using an LLM.

**BLAST methodology docs:**
- `B.L.A.S.T.md` — framework reference
- `LLM.md` — LLM optimization notes for test generation
- `Chapter_03_Test_Strategy_Buddy_0606/Anti_Hallucinations_Rules.md` — rules for reliable LLM outputs

### App — Jira Test Plan Generator

**Location:** `Chapter03_BLAST_FW_0606/jira-test-plan-app/`

**Tech:** React · TypeScript · Vite

```bash
cd Chapter03_BLAST_FW_0606/jira-test-plan-app
npm install
npm run dev
```

**Runs at:** `http://localhost:5173`

**Features:**
- Fetch Jira ticket details via Vite proxy (no CORS issues)
- Generate 15-section test plans using Groq LLM (qwen model)
- Export to Markdown (`.md`) and Word (`.docx`)
- Gherkin BDD syntax in all exports
- Risk matrix with severity colour coding
- Positive, negative, boundary, and edge case coverage

**Required environment variables** (create `.env` in root or `jira-test-plan-app/`):
```
JIRA_URL=<your-jira-instance-url>
JIRA_AUTH=<base64-encoded-email:api-token>
GROQ_API_KEY=<your-groq-api-key>
```

**Verification tools:**
```bash
node tools/verify_jira.js    # test Jira connectivity
node tools/verify_groq.js    # test Groq API
```

---

## Chapter 04 — AI Agents & n8n Workflows

**Location:** `Chapter_04_AI_Agents_n8n_0706/`

Covers building multi-step AI agents for QA workflows — from chat agents to bulk test case generation — using n8n for orchestration and a full-stack Next.js app for social content automation.

### n8n Workflow Library

**Location:** `Chapter_04_AI_Agents_n8n_0706/n8n_AIAgent/`

Import any `.json` file directly into your n8n instance (**Settings → Import Workflow**).

| Workflow file | Purpose |
|---|---|
| `My_01_QA_Agent.json` | Basic QA chat agent |
| `My_01_QA_Chat_Agent.json` | QA chat agent with memory |
| `My_02_QA_JIRA_Agent_CreateBug.json` | Auto-create Jira bugs from conversation |
| `My_03_QA_JIRA_Agent_PRD_Test_Cases.json` | Generate test cases from a PRD via Jira |
| `My_04_Bulk_CSV_Jira_100TC_Generator.json` | Bulk CSV → 100 test cases → Jira + Google Sheets |
| `STLC_VWO_Agent.json` | STLC agent tuned for VWO.com |
| `AI_3X_04_Read_PRD_TestCases_Excel_v2.json` | Read PRD, write test cases to Excel |

**My_04 workflow architecture:**
```
POST CSV → Parse → Loop over Jira IDs
                         ↓
                  AI Test Case Generator (Groq qwen3-32b)
                         ↓
            ┌── Fetch Jira Ticket
            ├── Fetch Confluence PRD
            └── Write TCs to Google Sheets
```

**Required credentials in n8n** (add under Credentials, not in workflow JSON):
- Jira API (email + API token)
- Confluence API (Basic Auth)
- Groq API key
- Google Sheets OAuth2

### Social AI Agent Workflow (n8n)

**Location:** `Chapter_04_AI_Agents_n8n_0706/social_ai_agent_using_n8n/`

- `social_ai_agent_using_n8n.json` — Import into n8n for automated social content generation

### App — ContentForge (Social AI Agent UI)

**Location:** `Chapter_04_AI_Agents_n8n_0706/social_ai_agent/contentforge/`

**Tech:** Next.js 14 · React 18 · Tailwind CSS · Groq SDK · Google GenAI

```bash
cd Chapter_04_AI_Agents_n8n_0706/social_ai_agent/contentforge
npm install
npm run dev
```

**Runs at:** `http://localhost:3030`

**Features:**
- AI-powered social media content calendar
- Schedule and generate posts via LLM
- Export content to Excel
- API routes: `/api/calendar`, `/api/run`, `/api/status`, `/api/today`, `/api/download`

**Required environment variables** (create `.env.local`):
```
GROQ_API_KEY=<your-groq-api-key>
GOOGLE_AI_API_KEY=<your-google-genai-key>
```

### STLC VWO Output

**Location:** `Chapter_04_AI_Agents_n8n_0706/STLC_VWO_Output/`

- `test_plan.md` — AI-generated test plan for VWO.com
- `playwright_test_cases.md` — AI-generated Playwright test code

---

## Standalone Projects

### Job Tracker AI (v1)

**Location:** `Project_Job_TRACKERAI/`

**Tech:** React 19 · Vite · Tailwind CSS · @dnd-kit · IndexedDB

```bash
cd Project_Job_TRACKERAI
npm install
npm run dev
```

**Runs at:** `http://localhost:5173`

Kanban-style job application tracker with drag-and-drop columns and offline-first IndexedDB storage.

### Job Tracker AI (v2)

**Location:** `Project_2_Job_Tracker_ai/`

**Tech:** React 18 · Vite 5 · Tailwind CSS · @dnd-kit · IndexedDB

```bash
cd Project_2_Job_Tracker_ai
npm install
npm run dev
```

**Runs at:** `http://localhost:5173`

Updated version of the job tracker with improved UI and drag-and-drop.

---

## Running Apps — Localhost Reference

| App | Directory | Command | URL |
|---|---|---|---|
| Jira Test Plan Generator | `Chapter03_BLAST_FW_0606/jira-test-plan-app/` | `npm run dev` | http://localhost:5173 |
| ContentForge (Social AI Agent) | `Chapter_04_AI_Agents_n8n_0706/social_ai_agent/contentforge/` | `npm run dev` | http://localhost:3030 |
| Job Tracker AI v1 | `Project_Job_TRACKERAI/` | `npm run dev` | http://localhost:5173 |
| Job Tracker AI v2 | `Project_2_Job_Tracker_ai/` | `npm run dev` | http://localhost:5173 |
| Playwright Tests | `Chapter02_Prompt_Eng_2405/Project02_PlaywrightFramework/Playwright_1406/` | `npm test` | — (CLI) |
| Selenium Tests | `Chapter02_Prompt_Eng_2405/Project03_Selenium_Framework/AdvanceSeleniumFramework/` | `mvn test` | — (CLI) |

> **Note:** Jira Test Plan Generator and both Job Tracker apps all default to port 5173. Run only one at a time, or configure a different port with `--port <number>` in the dev command.

---

## Tech Stack Overview

| Area | Tools |
|---|---|
| **UI / Frontend** | React 18/19, Next.js 14, Vite 8, Tailwind CSS |
| **Test Automation** | Playwright 1.40+, Selenium 4.25, TestNG 7.10, Maven 3, Java 11 |
| **AI / LLM** | Groq API (qwen3-32b), Google GenAI, Claude API |
| **Workflow Automation** | n8n (self-hosted), node-cron |
| **Integrations** | Jira REST API, Confluence REST API, Google Sheets API |
| **Storage** | IndexedDB (idb), local file system |
| **Export** | docx, ExcelJS, react-markdown |
| **Languages** | TypeScript, JavaScript, Java, Markdown |
