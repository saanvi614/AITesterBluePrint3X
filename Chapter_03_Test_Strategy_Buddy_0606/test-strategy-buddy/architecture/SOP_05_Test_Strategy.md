# SOP-05: Test Strategy Generation

## Goal
Generate a comprehensive Test Strategy document following B.L.A.S.T. framework and RICE-POT methodology. Export as .docx.

## Layer Mapping
- **Layer 1 (This SOP):** Rules for Test Strategy generation
- **Layer 2 (Navigation):** `src/pages/TestStrategy.jsx`
- **Layer 3 (Tools):** `src/services/groqService.js`, `src/services/exportService.js`

## Inputs
| Input | Source |
|---|---|
| Epic summary + description | AppContext + JIRA API |
| SUT content | `sutService.fetchSUT()` |

## RICE-POT Prompt Structure
| Component | Value |
|---|---|
| **R** Role | Senior QA Specialist, 12 years experience |
| **I** Instructions | Generate Test Strategy with 7 mandatory sections |
| **C** Context | Epic description + SUT page content |
| **E** Example | B.L.A.S.T. phase headings as structure |
| **P** Parameters | Formal & Technical; no hallucinations; traceable to input |
| **O** Output | Plain text with ## section headers |
| **T** Tone | Formal, technical, precise |

## Mandatory Sections in Output
1. Scope & Objectives
2. Test Approach (B.L.A.S.T. phases)
3. Testing Types (Functional, Non-Functional, Performance, Security)
4. Entry & Exit Criteria
5. Risk & Mitigation
6. Tools & Environment
7. Roles & Responsibilities

## Process
1. Fetch SUT content via `sutService.fetchSUT()`.
2. Fetch Epic from JIRA if `epicKey` available.
3. Call `groqService.generateTestStrategy()` → returns plain text.
4. Render in UI output box.
5. Export button → call `exportService.exportTestStrategyDocx()` → downloads `.docx`.

## Error Conditions
| Condition | Behaviour |
|---|---|
| GROQ failure | Show error message |
| Export fails | Show error in UI |
| SUT unreachable | Proceed with Epic context only |

## Invariants
- All 7 sections are mandatory in the output.
- Content must not be generic — must reference the SUT and Epic.
- Tone: Formal & Technical. No filler.
