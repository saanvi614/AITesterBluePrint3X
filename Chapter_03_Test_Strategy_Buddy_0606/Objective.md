# Test Strategy Buddy

## 1. Role & Context

I am a **QA Specialist with 12 years of experience**. As part of the current release, I want to build a lightweight React application that streamlines my JIRA-driven test planning workflow end-to-end.

- **System Under Test (SUT):** https://courses.thetestingacademy.com/
- **JIRA Instance:** https://testingaijira2026.atlassian.net/
- **JIRA & AI Authentication:** All credentials are provided by the user through a **Settings** screen in the UI — nothing is hard-coded in the app.

### Settings Screen — Required Configuration Fields

#### JIRA Configuration
| Field | Description |
|---|---|
| JIRA Base URL | e.g. `https://testingaijira2026.atlassian.net/` |
| JIRA Email ID | The email address associated with the JIRA account |
| JIRA API Token | Personal API token generated from Atlassian account settings |

JIRA API calls must use **Basic Auth** with the email and token (`email:token` base64-encoded).

#### GROQ (AI) Configuration
| Field | Description |
|---|---|
| GROQ API Key | API key from console.groq.com |
| Model | `openai/gpt-oss-120b` (free tier) |

All AI-generated content (Epic descriptions, Acceptance Criteria, Test Cases, Test Strategy, HLTP) must be generated via **GROQ API** using the above model. The GROQ API key must be stored locally in the app's settings state (not committed to the repo).

---

## 2. High-Level Objective

Create a **lightweight React application** that, for the home page URL above, allows the user to:

1. Create **one Epic** in JIRA.
2. Create all relevant **child items** (User Stories, Tasks, Bugs, etc.) under that Epic.
3. Create a **High-Level Test Plan (HLTP)** at the Epic level.
4. Create detailed **Test Cases** at the User Story level.
5. Define a **Test Strategy** following the **B.L.A.S.T** framework and **RICE POT** method.
6. View **Test Execution Summary** and **Dashboard**.
7. Navigate back to the **Home page** at any time.

The app must support both **Dark Mode** and **Light Mode**.

---

## 3. Functional Requirements

### 3.1 Create Epic
- A **"Create Epic"** button must be available on the UI.
- Epic creation is a **one-time activity** — if a user tries to create the Epic a second time, the app must display a **clear, proper error message**.
- The Epic must include a **proper Description** and **Acceptance Criteria**.

### 3.2 Create Child Item (User Story / Task / Bug / etc.)
- A **"Create Child Item"** button must be available on the UI.
- This button must be **disabled** until the Epic is created. Once the Epic exists, the button becomes active.
- The app should **suggest child items** based on the Epic's description and acceptance criteria.
- The user should be able to create **all standard JIRA child item types** (User Story, Task, Bug, etc.) — follow JIRA standards.
- Every User Story must include a **proper Description** and **Acceptance Criteria**.

### 3.3 Create High-Level Test Plan (HLTP)
- A **"Create HLTP"** button must be available on the UI.
- This button must be **disabled** until the Epic is created.
- The HLTP is created at the **Epic level** and must cover:
  - **Positive scenarios**
  - **Negative scenarios**
  - **Performance scenarios**
  - **Edge-case scenarios**
- **HLTP must accept Epic JIRA IDs only.** If a non-Epic JIRA ID is supplied, show a proper error message.

### 3.4 Create Test Case
- A **"Create Test Case"** button must be available on the UI.
- When clicked, it should prompt the user for a **JIRA ID / JIRA ticket** (must be a User Story).
- Based on that User Story's Description and Acceptance Criteria, the app should generate test cases covering:
  - Positive scenarios
  - Negative scenarios
  - Performance scenarios
  - Edge-case scenarios
- Each test case must include **proper test steps**.
- If the JIRA ID is **invalid**, show a proper error message.

### 3.5 Test Strategy
- A **"Test Strategy"** button must be available on the UI.
- The Test Strategy and all test cases must be generated using:
  - **B.L.A.S.T framework**
  - **RICE POT prompting method**

### 3.6 Test Execution Summary
- Provide a screen that summarizes test execution status (pass/fail/blocked/skipped) for the current Epic and its associated test cases.

### 3.7 Dashboard
- Provide a Dashboard screen that gives an at-a-glance view of:
  - Epic status
  - Child item counts by type
  - HLTP coverage (Positive / Negative / Performance / Edge)
  - Test execution stats

---

## 4. UI / UX Requirements

### 4.1 Button Sequence (Navigation Order)
The primary action buttons must appear in this exact order on the UI:

1. **Epic**
2. **Child Item**
3. **HLTP**
4. **Test Strategy**
5. **Test Execution Summary**
6. **Dashboard**

The user must always be able to **navigate back to the Home page** via clear navigation.

### 4.2 Theme Support
- The UI must support both **Dark Mode** and **Light Mode**, with a toggle accessible from the UI.

### 4.3 Settings
- A **Settings** screen must allow the user to enter and save their **JIRA API token** securely (token should not be committed to the repo).

### 4.4 Footer
- The footer must display: **@swatij**

---

## 5. State & Validation Rules (Summary)

| Action | Enabled When | Error Condition |
|---|---|---|
| Create Epic | Always (only once) | Epic already exists → show error |
| Create Child Item | Epic exists | Otherwise button disabled |
| Create HLTP | Epic exists | Non-Epic JIRA ID → show error |
| Create Test Case | User Story JIRA ID provided | Invalid JIRA ID → show error |
| Test Strategy | Always available | — |

---

## 6. Frameworks & Reference Documents to Follow

While building the application and generating content (Epics, User Stories, HLTP, Test Cases, Test Strategy), strictly follow the attached reference documents:

- **B.L.A.S.T.md** — B.L.A.S.T framework for test design
- **Anti_Hallucinations_Rules.md** — rules to prevent hallucinated test content
- **concept.md** — core concept document for the framework
- **Objective.md** — objectives document
- **RICE_POT.md** — RICE POT prompting methodology
- **Test Strategy Sample** — reference template for the test strategy output

---

## 7. Tech Stack & Deliverables

- **Frontend:** Lightweight React application
- **Modes:** Dark + Light
- **JIRA Integration:** Atlassian REST API, authenticated with user-supplied token from Settings
- **Hosting / Deployment:** Production-ready — push to GitHub, deploy to Vercel, share live link
- **Footer:** `@swatij`
- **SUT reference shown in UI:** https://courses.thetestingacademy.com/

---

## 8. Acceptance Criteria for the App Itself

- [ ] Home page renders with the six buttons in the specified order plus theme toggle and footer `@swatij`.
- [ ] Settings screen accepts and stores the JIRA token locally (never hard-coded).
- [ ] "Create Epic" works exactly once; second attempt shows a clear error message.
- [ ] "Create Child Item" is disabled until the Epic exists; once enabled, it can create User Story / Task / Bug following JIRA standards and suggests items from Epic description + AC.
- [ ] "Create HLTP" is disabled until the Epic exists; rejects non-Epic JIRA IDs with a proper error; produces Positive / Negative / Performance / Edge sections.
- [ ] "Create Test Case" prompts for a User Story JIRA ID; rejects invalid IDs with a proper error; produces test cases with proper test steps across Positive / Negative / Performance / Edge.
- [ ] "Test Strategy" output follows B.L.A.S.T and RICE POT.
- [ ] Test Execution Summary and Dashboard screens render.
- [ ] User can navigate back to Home from any screen.
- [ ] Dark and Light modes both work cleanly.
- [ ] App is deployed live (GitHub + Vercel link shared).
