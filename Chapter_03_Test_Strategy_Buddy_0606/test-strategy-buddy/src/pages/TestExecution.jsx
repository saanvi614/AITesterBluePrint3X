import { useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { useApp } from '../context/AppContext'
import { getEpicChildren } from '../services/jiraService'

const STATUS_COLORS = {
  'To Do': 'var(--text-muted)',
  'In Progress': 'var(--info)',
  'Done': 'var(--accent)',
  'Blocked': 'var(--danger)',
}

export default function TestExecution() {
  const { settings } = useSettings()
  const { epicKey, epicSummary } = useApp()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [issues, setIssues] = useState([])
  const [execStatus, setExecStatus] = useState({})

  const handleLoad = async () => {
    if (!epicKey) { setError('No active Epic. Create an Epic first.'); return }
    setLoading(true)
    setError(null)
    try {
      const data = await getEpicChildren(settings, epicKey)
      setIssues(data.issues || [])
      const initial = {}
      ;(data.issues || []).forEach(i => { initial[i.key] = 'To Do' })
      setExecStatus(initial)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const setStatus = (key, status) => setExecStatus(s => ({ ...s, [key]: status }))

  const counts = Object.values(execStatus).reduce((acc, s) => {
    acc[s] = (acc[s] || 0) + 1
    return acc
  }, {})

  const total = issues.length

  return (
    <>
      <div className="page-header">
        <h1>Test Execution Summary</h1>
        <p>Track test execution status across all child items of the active Epic.</p>
      </div>

      {epicKey
        ? <div className="epic-banner"><span>Active Epic:</span> <strong>{epicKey}</strong> <span style={{ color: 'var(--text-muted)' }}>— {epicSummary}</span></div>
        : <div className="alert alert-info">No active Epic. Create an Epic first to load child items.</div>
      }

      {error && <div className="alert alert-error">{error}</div>}

      {issues.length === 0 && (
        <div className="card">
          <button className="btn btn-primary" onClick={handleLoad} disabled={loading || !epicKey}>
            {loading ? <><span className="spinner" /> Loading issues…</> : 'Load Child Issues from JIRA'}
          </button>
        </div>
      )}

      {total > 0 && (
        <>
          <div className="stats-grid">
            {[
              { label: 'Total', value: total, color: 'var(--text)' },
              { label: 'To Do', value: counts['To Do'] || 0, color: 'var(--text-muted)' },
              { label: 'In Progress', value: counts['In Progress'] || 0, color: 'var(--info)' },
              { label: 'Done', value: counts['Done'] || 0, color: 'var(--accent)' },
              { label: 'Blocked', value: counts['Blocked'] || 0, color: 'var(--danger)' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-card-value" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-card-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-title">Issue Execution Status</div>
            <ul className="item-list">
              {issues.map(issue => (
                <li key={issue.key}>
                  <a href={`${settings.jiraBaseUrl}browse/${issue.key}`} target="_blank" rel="noreferrer" className="item-key">{issue.key}</a>
                  <span className="item-type">{issue.fields?.issuetype?.name}</span>
                  <span style={{ flex: 1 }}>{issue.fields?.summary}</span>
                  <select
                    className="form-select"
                    style={{ width: 'auto', padding: '3px 8px', fontSize: 12, color: STATUS_COLORS[execStatus[issue.key]] }}
                    value={execStatus[issue.key]}
                    onChange={e => setStatus(issue.key, e.target.value)}
                  >
                    <option>To Do</option>
                    <option>In Progress</option>
                    <option>Done</option>
                    <option>Blocked</option>
                  </select>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </>
  )
}
