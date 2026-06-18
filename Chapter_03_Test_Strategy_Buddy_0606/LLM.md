# LLM.md — Project Constitution
## Test Strategy Buddy

> This file is LAW. Update only when: a schema changes, a rule is added, or architecture is modified.

---

## 1. Project Identity
- **App Name:** Test Strategy Buddy
- **SUT:** https://courses.thetestingacademy.com/
- **JIRA Instance:** https://testingaijira2026.atlassian.net/
- **Frameworks:** B.L.A.S.T + RICE POT

---

## 2. Data Schema
> PENDING — To be defined once Discovery Questions are answered.

### 2.1 Input Shape
```json
{
  "settings": {
    "jiraBaseUrl": "string",
    "jiraEmail": "string",
    "jiraApiToken": "string",
    "groqApiKey": "string",
    "groqModel": "string"
  }
}
```

### 2.2 Epic Payload
```json
{
  "summary": "string",
  "description": "string",
  "acceptanceCriteria": "string",
  "issueType": "Epic",
  "projectKey": "SCRUM"
}
```

### 2.3 Child Item Payload
```json
{
  "summary": "string",
  "description": "string",
  "acceptanceCriteria": "string",
  "issueType": "Story | Task | Bug | Sub-task",
  "projectKey": "SCRUM",
  "epicLink": "SCRUM-{epicId}"
}
```

### 2.4 HLTP Payload
```json
{
  "epicId": "string",
  "positive": ["string"],
  "negative": ["string"],
  "performance": ["string"],
  "edgeCase": ["string"]
}
```

### 2.5 Test Case Payload
```json
{
  "storyId": "string",
  "testCases": [
    {
      "id": "string",
      "title": "string",
      "type": "Positive | Negative | Performance | Edge",
      "steps": ["string"],
      "expectedResult": "string"
    }
  ]
}
```

### 2.6 Export Payload
```json
{
  "testStrategy": ".docx",
  "testCases": ".csv"
}
```

---

## 3. North Star
A deployed React app on Vercel that lets a QA Engineer create Epics, User Stories, HLTP, and Test Cases in JIRA — all AI-generated via GROQ — in one end-to-end workflow.
**Primary success criterion:** Live Vercel URL working end-to-end.

---

## 4. Behavioral Rules
- **Tone:** Formal & Technical — precise QA language, structured, no filler.
- **Child Items per Epic:** Open-ended — no cap enforced.
- **Anti-Hallucination:** Follow Anti_Hallucinations_Rules.md in full. No additional rules.
- **Do Not:** Generate test cases without steps; use placeholder/lorem ipsum data; hard-code any credentials.

---

## 4. Architectural Invariants
- Settings are NEVER hard-coded; all credentials come from the Settings screen.
- Epic can only be created once per session.
- Child Item and HLTP buttons are disabled until Epic exists.
- HLTP accepts Epic JIRA IDs only.
- Test Case generation requires a valid User Story JIRA ID.

---

## 5. Tech Stack (Confirmed)
- React 18 + Vite 5
- react-router-dom v6
- docx v8 (Test Strategy .docx export)
- Native JS CSV (Test Cases .csv export)
- Vercel serverless function: api/fetch-sut.js (SUT CORS proxy)
- No UI framework — pure CSS custom properties

## 6. Maintenance Log
| Date | Change | File Updated |
|---|---|---|
| 2026-06-16 | Initial build — all phases complete | All SOPs, all pages |