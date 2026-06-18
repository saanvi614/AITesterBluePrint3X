import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { useApp } from '../context/AppContext'
import { generateHLTP } from '../services/groqService'
import { getIssue, addComment } from '../services/jiraService'

export default function HLTP() {
  const { settings } = useSettings()
  const { epicKey, epicSummary } = useApp()
  const navigate = useNavigate()
  const [jiraId, setJiraId] = useState(epicKey || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hltp, setHltp] = useState(null)
  const [posting, setPosting] = useState(false)
  const [posted, setPosted] = useState(false)

  if (!epicKey) {
    return (
      <>
        <div className="page-header"><h1>High-Level Test Plan (HLTP)</h1></div>
        <div className="alert alert-error">Epic not found. <button className="btn btn-secondary btn-sm" onClick={() => navigate('/epic')}>Create Epic first</button></div>
      </>
    )
  }

  const handleGenerate = async () => {
    setError(null)
    setHltp(null)
    setPosted(false)

    if (!jiraId.trim()) { setError('JIRA ID is required.'); return }

    setLoading(true)
    try {
      const issue = await getIssue(settings, jiraId.trim())
      if (issue.fields?.issuetype?.name !== 'Epic') {
        setError(`${jiraId.trim()} is a ${issue.fields?.issuetype?.name}, not an Epic. HLTP accepts Epic JIRA IDs only.`)
        setLoading(false)
        return
      }
      const desc = issue.fields?.description?.content?.[0]?.content?.[0]?.text || epicSummary
      const data = await generateHLTP(settings, epicSummary, desc)
      setHltp(data)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const handlePostToJira = async () => {
    setPosting(true)
    try {
      const body = [
        '=== HIGH-LEVEL TEST PLAN (HLTP) ===',
        '',
        '--- POSITIVE SCENARIOS ---',
        ...(hltp.positive || []).map((s, i) => `${i + 1}. ${s}`),
        '',
        '--- NEGATIVE SCENARIOS ---',
        ...(hltp.negative || []).map((s, i) => `${i + 1}. ${s}`),
        '',
        '--- PERFORMANCE SCENARIOS ---',
        ...(hltp.performance || []).map((s, i) => `${i + 1}. ${s}`),
        '',
        '--- EDGE-CASE SCENARIOS ---',
        ...(hltp.edgeCase || []).map((s, i) => `${i + 1}. ${s}`),
      ].join('\n')
      await addComment(settings, jiraId.trim(), body)
      setPosted(true)
    } catch (err) {
      setError(err.message)
    }
    setPosting(false)
  }

  const Section = ({ title, items, color }) => (
    <div className="hltp-section">
      <h3 style={{ color }}>{title}</h3>
      <ul className="hltp-list">
        {(items || []).map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </div>
  )

  return (
    <>
      <div className="page-header">
        <h1>High-Level Test Plan (HLTP)</h1>
        <p>Generate HLTP covering Positive, Negative, Performance, and Edge scenarios. Accepts Epic JIRA IDs only.</p>
      </div>

      <div className="epic-banner">
        <span>Active Epic:</span> <strong>{epicKey}</strong>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="form-group">
          <label className="form-label">Epic JIRA ID</label>
          <input className="form-input" value={jiraId} onChange={e => setJiraId(e.target.value)} placeholder="e.g. SCRUM-1" />
          <p className="form-hint">Must be an Epic type. Non-Epic IDs will be rejected.</p>
        </div>
        <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
          {loading ? <><span className="spinner" /> Generating HLTP…</> : 'Generate HLTP'}
        </button>
      </div>

      {hltp && (
        <div className="card">
          <div className="card-title">High-Level Test Plan — {jiraId.trim()}</div>
          <Section title="Positive Scenarios" items={hltp.positive} color="var(--accent)" />
          <Section title="Negative Scenarios" items={hltp.negative} color="var(--danger)" />
          <Section title="Performance Scenarios" items={hltp.performance} color="var(--info)" />
          <Section title="Edge-Case Scenarios" items={hltp.edgeCase} color="var(--warning)" />
          <div className="action-row">
            <button className="btn btn-primary" onClick={handlePostToJira} disabled={posting || posted}>
              {posting ? <><span className="spinner" /> Posting to JIRA…</> : posted ? 'Posted to JIRA' : 'Post HLTP to JIRA'}
            </button>
          </div>
          {posted && <div className="alert alert-success" style={{ marginTop: 12 }}>HLTP posted as a comment on {jiraId.trim()}.</div>}
        </div>
      )}
    </>
  )
}