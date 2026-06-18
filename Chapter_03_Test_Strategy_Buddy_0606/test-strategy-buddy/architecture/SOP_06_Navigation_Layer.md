# SOP-06: Navigation Layer (Layer 2)

## Role
This is the decision-making layer. React pages orchestrate data flow between SOPs (Layer 1) and Tools (Layer 3 services). Pages never perform business logic themselves — they call services in the correct order.

## Routing Map
| Route | Page | SOP |
|---|---|---|
| `/` | Home.jsx | Renders navigation cards; enforces Epic prerequisite visually |
| `/settings` | Settings.jsx | Reads/writes SettingsContext → localStorage |
| `/epic` | Epic.jsx | SOP-01 |
| `/child-item` | ChildItem.jsx | SOP-02 |
| `/hltp` | HLTP.jsx | SOP-03 |
| `/test-case` | TestCase.jsx | SOP-04 |
| `/test-strategy` | TestStrategy.jsx | SOP-05 |
| `/test-execution` | TestExecution.jsx | Display only |
| `/dashboard` | Dashboard.jsx | Aggregates JIRA data |

## State Flow
```
SettingsContext (localStorage)
  └─ credentials → all service calls

AppContext (localStorage)
  └─ epicId, epicKey, epicSummary → gates Child Item, HLTP, Dashboard
  └─ theme → data-theme attribute on <html>
```

## Decision Rules
1. If `epicKey` is null → Child Item and HLTP pages redirect to /epic.
2. If JIRA ID supplied to HLTP is not Epic type → halt, do not call GROQ.
3. If JIRA ID supplied to Test Case is invalid → halt, do not call GROQ.
4. If a service call fails → display error inline; never silently swallow errors.
