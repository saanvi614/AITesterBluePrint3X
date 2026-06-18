# SOP-02: Child Item Creation

## Goal
Generate and create JIRA child items (User Stories, Tasks, Bugs) under the active Epic.

## Layer Mapping
- **Layer 1 (This SOP):** Rules and logic for child item creation
- **Layer 2 (Navigation):** `src/pages/ChildItem.jsx`
- **Layer 3 (Tools):** `src/services/groqService.js`, `src/services/jiraService.js`, `src/services/sutService.js`

## Pre-condition
- Epic must exist in AppContext (`epicKey` is set). Button disabled otherwise.

## Inputs
| Input | Source |
|---|---|
| Epic Key | AppContext → `epicKey` |
| Epic description | JIRA API → `getIssue(epicKey)` |
| SUT content | `sutService.fetchSUT()` |

## Process
1. Verify `epicKey` exists — if not, redirect to Epic page.
2. Fetch full Epic issue from JIRA to get description.
3. Fetch SUT content via `sutService.fetchSUT()`.
4. Call `groqService.generateChildItems()` → returns array of `{ summary, issueType, description, acceptanceCriteria }`.
5. Display suggestions with checkboxes for user selection.
6. For each selected item, call `jiraService.createChildItem()` with `epicKey` as parent link.
7. Display created items with JIRA links.

## Error Conditions
| Condition | Behaviour |
|---|---|
| Epic not in AppContext | Redirect to /epic with error message |
| GROQ generation fails | Show error, allow retry |
| Individual item creation fails | Mark that item as failed, continue with others |

## Invariants
- Supported issue types: `Story`, `Task`, `Bug` only (JIRA standards).
- Every child item must have `description` and `acceptanceCriteria`.
- Epic link field: `customfield_10014` set to `epicKey`.
- No cap on number of child items — open-ended.
