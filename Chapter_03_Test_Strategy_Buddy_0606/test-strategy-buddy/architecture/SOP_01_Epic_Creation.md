# SOP-01: Epic Creation

## Goal
Create one JIRA Epic per session for the SUT: https://courses.thetestingacademy.com/

## Layer Mapping
- **Layer 1 (This SOP):** Rules and logic for Epic creation
- **Layer 2 (Navigation):** `src/pages/Epic.jsx` — orchestrates the flow
- **Layer 3 (Tools):** `src/services/sutService.js`, `src/services/groqService.js`, `src/services/jiraService.js`

## Inputs
| Input | Source |
|---|---|
| SUT URL | Settings → `sutUrl` |
| GROQ credentials | Settings → `groqApiKey`, `groqModel` |
| JIRA credentials | Settings → `jiraBaseUrl`, `jiraEmail`, `jiraApiToken` |
| JIRA Project Key | Hard-coded: `SCRUM` |

## Process
1. Check AppContext — if `epicKey` already exists, **halt with error**. One Epic per session only.
2. Call `sutService.fetchSUT()` to retrieve and strip SUT home page content.
3. Call `groqService.generateEpicContent()` with SUT content → returns `{ summary, description, acceptanceCriteria }`.
4. Display preview to user for review/edit.
5. On confirm, call `jiraService.createEpic()` → JIRA REST API POST `/rest/api/3/issue`.
6. Save `{ id, key, summary }` to AppContext and localStorage.

## Error Conditions
| Condition | Behaviour |
|---|---|
| Epic already exists | Show error: "Epic {key} already exists. Only one Epic can be created per session." |
| GROQ API failure | Show error message from API response |
| JIRA API failure | Show JIRA error message (e.g., auth failure, project not found) |
| SUT unreachable | Continue with fallback message — do not block Epic generation |

## Invariants
- Issue type MUST be `Epic`.
- Project key MUST be `SCRUM`.
- Description and Acceptance Criteria are mandatory fields.
- No placeholder or lorem ipsum content permitted.
