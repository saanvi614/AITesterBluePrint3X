const authHeader = (s) => `Basic ${btoa(`${s.jiraEmail}:${s.jiraApiToken}`)}`

// Dev: Vite proxy (/jira-api → Atlassian, no CORS). Prod: Vercel function at exact /api/jira.
async function jiraFetch(settings, method, jiraPath, body) {
  if (import.meta.env.DEV) {
    return fetch(`/jira-api${jiraPath}`, {
      method,
      headers: {
        'Authorization': authHeader(settings),
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  }
  return fetch('/api/jira', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jiraBase: settings.jiraBaseUrl.replace(/\/$/, ''),
      jiraAuth: authHeader(settings),
      method,
      jiraPath,
      body,
    }),
  })
}

export async function createEpic(settings, { summary, description, acceptanceCriteria }) {
  const res = await jiraFetch(settings, 'POST', '/rest/api/3/issue', {
    fields: {
      project: { key: 'SCRUM' },
      summary,
      description: {
        type: 'doc', version: 1,
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: description }] },
          { type: 'paragraph', content: [{ type: 'text', text: `Acceptance Criteria:\n${acceptanceCriteria}` }] },
        ]
      },
      issuetype: { name: 'Epic' },
    }
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.errorMessages?.[0] || `JIRA error ${res.status}`)
  }
  return res.json()
}

export async function createChildItem(settings, { summary, description, acceptanceCriteria, issueType, epicKey }) {
  const fields = {
    project: { key: 'SCRUM' },
    summary,
    description: {
      type: 'doc', version: 1,
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: description }] },
        { type: 'paragraph', content: [{ type: 'text', text: `Acceptance Criteria:\n${acceptanceCriteria}` }] },
      ]
    },
    issuetype: { name: issueType },
  }
  if (epicKey) fields['customfield_10014'] = epicKey

  const res = await jiraFetch(settings, 'POST', '/rest/api/3/issue', { fields })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.errorMessages?.[0] || `JIRA error ${res.status}`)
  }
  return res.json()
}

export async function getIssue(settings, issueKey) {
  const res = await jiraFetch(settings, 'GET', `/rest/api/3/issue/${issueKey}`)
  if (!res.ok) throw new Error(`Issue ${issueKey} not found (${res.status})`)
  return res.json()
}

export async function addComment(settings, issueKey, body) {
  const res = await jiraFetch(settings, 'POST', `/rest/api/3/issue/${issueKey}/comment`, {
    body: {
      type: 'doc', version: 1,
      content: [{ type: 'paragraph', content: [{ type: 'text', text: body }] }]
    }
  })
  if (!res.ok) throw new Error(`Failed to add comment to ${issueKey}`)
  return res.json()
}

export async function getEpicChildren(settings, epicKey) {
  const jql = `"Epic Link" = ${epicKey} OR parent = ${epicKey}`
  const res = await jiraFetch(
    settings, 'GET',
    `/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=50`
  )
  if (!res.ok) throw new Error('Failed to fetch child issues')
  return res.json()
}