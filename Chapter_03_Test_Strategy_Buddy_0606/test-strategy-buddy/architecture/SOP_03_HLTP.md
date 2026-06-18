# SOP-03: High-Level Test Plan (HLTP)

## Goal
Generate an HLTP covering Positive, Negative, Performance, and Edge-Case scenarios for an Epic. Post it as a JIRA comment.

## Layer Mapping
- **Layer 1 (This SOP):** Rules for HLTP generation and validation
- **Layer 2 (Navigation):** `src/pages/HLTP.jsx`
- **Layer 3 (Tools):** `src/services/groqService.js`, `src/services/jiraService.js`

## Pre-condition
- Epic must exist in AppContext.

## Inputs
| Input | Source |
|---|---|
| JIRA ID (user-supplied) | UI input field |
| Epic description | JIRA API → `getIssue(jiraId)` |

## Process
1. Verify `epicKey` exists in AppContext — if not, redirect to /epic.
2. Validate user-supplied JIRA ID is non-empty.
3. Fetch issue from JIRA → verify `issuetype.name === 'Epic'`.
4. If NOT Epic → halt with error: "{id} is a {type}, not an Epic. HLTP accepts Epic JIRA IDs only."
5. Call `groqService.generateHLTP()` → returns `{ positive[], negative[], performance[], edgeCase[] }`.
6. Render four sections in UI.
7. On user confirm → call `jiraService.addComment()` to post HLTP text to the Epic ticket.

## Error Conditions
| Condition | Behaviour |
|---|---|
| Non-Epic JIRA ID supplied | Halt with specific error message identifying issue type |
| Invalid / non-existent JIRA ID | Show JIRA 404 error |
| GROQ failure | Show error, allow retry |
| Comment post fails | Show error — HLTP still visible in UI |

## Invariants
- HLTP MUST cover all four scenario types: Positive, Negative, Performance, Edge.
- No scenarios may be fabricated — all must derive from Epic description and SUT context.
