const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

async function callGroq(settings, systemPrompt, userPrompt) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${settings.groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: settings.groqModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `GROQ error ${res.status}`)
  }
  const data = await res.json()
  return data.choices[0].message.content
}

// RICE-POT system prompt base
const SYSTEM_BASE = `
ROLE: You are a Senior QA Specialist with 12 years of experience. You follow the B.L.A.S.T. framework (Blueprint, Link, Architect, Stylize, Trigger) and RICE-POT prompting methodology.

PARAMETERS:
- Output must be formal and technical. No filler content.
- Every assertion must be traceable to provided input. Do NOT invent features or behaviour not present in the source material.
- If information is missing, state "Insufficient information to determine." Do NOT guess.
- Output must be deterministic and repeatable.
- Anti-Hallucination: Label any inference explicitly as "Inference (low confidence)."

TONE: Formal, technical, precise.
`.trim()

export async function generateEpicContent(settings, sutContent) {
  const system = SYSTEM_BASE
  const user = `
CONTEXT: The System Under Test (SUT) is https://courses.thetestingacademy.com/
Below is the fetched content from the SUT home page:
---
${sutContent}
---

INSTRUCTIONS:
Generate a JIRA Epic for the SUT above. Output STRICT JSON only — no markdown fences.

OUTPUT FORMAT:
{
  "summary": "Epic title (concise)",
  "description": "2–3 sentence technical description of the Epic scope",
  "acceptanceCriteria": "Bullet-point list of acceptance criteria (one per line, prefixed with -)"
}
`.trim()
  const raw = await callGroq(settings, system, user)
  return JSON.parse(raw.replace(/```json|```/g, '').trim())
}

export async function generateChildItems(settings, epicSummary, epicDescription, sutContent) {
  const system = SYSTEM_BASE
  const user = `
CONTEXT: Epic Summary: "${epicSummary}"
Epic Description: "${epicDescription}"
SUT Content (excerpt): "${sutContent.slice(0, 1500)}"

INSTRUCTIONS:
Based strictly on the Epic above, generate a list of child JIRA items (User Stories, Tasks, Bugs).
Output STRICT JSON array only — no markdown fences.

OUTPUT FORMAT:
[
  {
    "summary": "string",
    "issueType": "Story|Task|Bug",
    "description": "string",
    "acceptanceCriteria": "- criterion 1\\n- criterion 2"
  }
]
`.trim()
  const raw = await callGroq(settings, system, user)
  return JSON.parse(raw.replace(/```json|```/g, '').trim())
}

export async function generateHLTP(settings, epicSummary, epicDescription) {
  const system = SYSTEM_BASE
  const user = `
CONTEXT: Epic Summary: "${epicSummary}"
Epic Description: "${epicDescription}"

INSTRUCTIONS:
Generate a High-Level Test Plan (HLTP) following the B.L.A.S.T. framework.
Cover: Positive, Negative, Performance, Edge-Case scenarios.
Output STRICT JSON only — no markdown fences.

OUTPUT FORMAT:
{
  "positive": ["scenario 1", "scenario 2"],
  "negative": ["scenario 1", "scenario 2"],
  "performance": ["scenario 1", "scenario 2"],
  "edgeCase": ["scenario 1", "scenario 2"]
}
`.trim()
  const raw = await callGroq(settings, system, user)
  return JSON.parse(raw.replace(/```json|```/g, '').trim())
}

export async function generateTestCases(settings, storyId, storySummary, storyDescription, storyAC) {
  const system = SYSTEM_BASE
  const user = `
CONTEXT:
JIRA ID: ${storyId}
User Story: "${storySummary}"
Description: "${storyDescription}"
Acceptance Criteria: "${storyAC}"

INSTRUCTIONS:
Generate detailed test cases following the B.L.A.S.T. framework and RICE-POT method.
Cover: Positive, Negative, Performance, Edge-Case scenarios.
Every test case MUST include test steps. Do NOT generate test cases without steps.
Output STRICT JSON array only — no markdown fences.

OUTPUT FORMAT:
[
  {
    "id": "TC-001",
    "title": "string",
    "type": "Positive|Negative|Performance|Edge",
    "steps": ["Step 1: ...", "Step 2: ..."],
    "expectedResult": "string"
  }
]
`.trim()
  const raw = await callGroq(settings, system, user)
  return JSON.parse(raw.replace(/```json|```/g, '').trim())
}

export async function generateTestStrategy(settings, epicSummary, epicDescription, sutContent) {
  const system = SYSTEM_BASE
  const user = `
CONTEXT:
SUT: https://courses.thetestingacademy.com/
Epic: "${epicSummary}"
Description: "${epicDescription}"
SUT Content (excerpt): "${sutContent.slice(0, 1500)}"

INSTRUCTIONS:
Generate a comprehensive Test Strategy document following the B.L.A.S.T. framework (Blueprint, Link, Architect, Stylize, Trigger) and RICE-POT methodology.

Include the following sections:
1. Scope & Objectives
2. Test Approach (B.L.A.S.T. phases)
3. Testing Types (Functional, Non-Functional, Performance, Security)
4. Entry & Exit Criteria
5. Risk & Mitigation
6. Tools & Environment
7. Roles & Responsibilities

Output as plain text with clear section headers (##). Formal and technical tone.
`.trim()
  return callGroq(settings, system, user)
}
