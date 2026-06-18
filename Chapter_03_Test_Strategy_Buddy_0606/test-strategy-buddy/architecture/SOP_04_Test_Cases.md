# SOP-04: Test Case Generation

## Goal
Generate detailed test cases for a User Story with proper test steps. Post to JIRA and export as CSV.

## Layer Mapping
- **Layer 1 (This SOP):** Rules for test case generation and validation
- **Layer 2 (Navigation):** `src/pages/TestCase.jsx`
- **Layer 3 (Tools):** `src/services/groqService.js`, `src/services/jiraService.js`, `src/services/exportService.js`

## Inputs
| Input | Source |
|---|---|
| JIRA ID (user-supplied) | UI input field |
| Story summary, description, AC | JIRA API → `getIssue(jiraId)` |

## Process
1. Validate JIRA ID is non-empty.
2. Fetch issue from JIRA — verify it exists.
3. If issue not found → show error: "Invalid JIRA ID — issue not found."
4. Extract `summary`, `description`, `acceptanceCriteria` from issue fields.
5. Call `groqService.generateTestCases()` → returns array of test case objects.
6. Render test cases grouped by type (Positive / Negative / Performance / Edge).
7. On user confirm → call `jiraService.addComment()` to post test cases to the ticket.
8. Export button → call `exportService.exportTestCasesCSV()` to download `.csv`.

## Error Conditions
| Condition | Behaviour |
|---|---|
| Invalid / non-existent JIRA ID | Show error: "Invalid JIRA ID — issue not found." |
| GROQ returns test case without steps | Discard that test case, log warning |
| Comment post fails | Show error — test cases remain visible in UI |

## Invariants
- Every test case MUST have at minimum one test step. Cases without steps are invalid.
- Must cover all four types: Positive, Negative, Performance, Edge.
- No placeholder test data — all derived from Story description and AC.
- CSV columns: ID, Title, Type, Steps, Expected Result.
