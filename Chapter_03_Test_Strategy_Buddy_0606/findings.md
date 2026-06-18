# Findings — Test Strategy Buddy

## Discovered Constraints
- Credentials (JIRA email, JIRA API token, GROQ API key) stored in `.env` for local dev.
- Settings screen in the React app serves as the production credential store — nothing hard-coded in source.
- GROQ model: `openai/gpt-oss-120b` (free tier).
- JIRA Project Key: `SCRUM` — tickets will appear as SCRUM-1, SCRUM-2, etc.
- Source of Truth: App actively fetches SUT (https://courses.thetestingacademy.com/) at runtime; extracted page content is fed into GROQ to generate context-aware Epics, Stories, and Test Cases. JIRA is the write destination.
- Delivery Payload: Generated content (HLTP, Test Cases, Test Strategy) is BOTH written to JIRA tickets (description/comments via API) AND displayed in the React UI.
- Download exports: Test Strategy downloadable as `.docx`; Test Cases downloadable as `.csv`.
- GitHub Repo: https://github.com/saanvi614/AITesterBluePrint3X (existing repo — app will live here, deployed to Vercel).

## API Behaviours
> To be populated during Phase 2 Link.

## Errors & Learnings
> To be populated during Phase 3 Architect.