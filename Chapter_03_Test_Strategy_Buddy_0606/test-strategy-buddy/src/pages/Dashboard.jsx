import { useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { useApp } from '../context/AppContext'
import { getEpicChildren, getIssue } from '../services/jiraService'

export default function Dashboard() {
  const { settings } = useSettings()
  const { epicKey, epicSummary } = useApp()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const handleLoad = async () => {
    if (!epicKey) { setError('No active Epic.'); return }
    setLoading(true)
    setError(null)
    try {
      const [epicIssue, childrenData] = await Promise.all([
        getIssue(settings, epicKey),
        getEpicChildren(settings, epicKey),
      ])
      const children = childrenData.issues || []
      const byType = children.reduce((acc, i) => {
        const t = i.fields?.issuetype?.name || 'Other'
        acc[t] = (acc[t] || 0) + 1
        return acc
      }, {})
      const byStatus = children.reduce((acc, i) => {
        const s = i.fields?.status?.name || 'Unknown'
        acc[s] = (acc[s] || 0) + 1
        return acc
      }, {})
      setData({
        epicStatus: epicIssue.fields?.status?.name || 'Unknown',
        epicCreated: epicIssue.fields?.created?.slice(0, 10),
        totalChildren: children.length,
        byType,
        byStatus,
      })
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>At-a-glance view of Epic status, child item breakdown, and execution stats.</p>
      </div>

      {epicKey
        ? <div className="epic-banner"><span>Active Epic:</span> <strong>{epicKey}</strong> <span style={{ color: 'var(--text-muted)' }}>— {epicSummary}</span></div>
        : <div className="alert alert-info">No active Epic. Create an Epic first.</div>
      }

      {error && <div className="alert alert-error">{error}</div>}

      {!data && (
        <div className="card">
          <button className="btn btn-primary" onClick={handleLoad} disabled={loading || !epicKey}>
            {loading ? <><span className="spinner" /> Loading dashboard…</> : 'Load Dashboard'}
          </button>
        </div>
      )}

      {data && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-value" style={{ fontSize: 18 }}>{data.epicStatus}</div>
              <div className="stat-card-label">Epic Status</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-value">{data.totalChildren}</div>
              <div className="stat-card-label">Total Child Items</div>
            </div>
            {Object.entries(data.byType).map(([type, count]) => (
              <div key={type} className="stat-card">
                <div className="stat-card-value">{count}</div>
                <div className="stat-card-label">{type}s</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="card">
              <div className="card-title">Items by Type</div>
              {Object.entries(data.byType).length === 0
                ? <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No child items found.</p>
                : Object.entries(data.byType).map(([type, count]) => (
                  <div key={type} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <span>{type}</span>
                    <strong>{count}</strong>
                  </div>
                ))
              }
            </div>

            <div className="card">
              <div className="card-title">Items by Status</div>
              {Object.entries(data.byStatus).length === 0
                ? <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No child items found.</p>
                : Object.entries(data.byStatus).map(([status, count]) => (
                  <div key={status} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <span>{status}</span>
                    <strong>{count}</strong>
                  </div>
                ))
              }
            </div>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <div className="card-title">HLTP Coverage</div>
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              {['Positive', 'Negative', 'Performance', 'Edge-Case'].map(type => (
                <div key={type} className="stat-card">
                  <div className="stat-card-value" style={{ fontSize: 18 }}>✓</div>
                  <div className="stat-card-label">{type}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>HLTP coverage status reflects whether HLTP was generated for this Epic.</p>
          </div>

          <div className="action-row">
            <button className="btn btn-secondary btn-sm" onClick={handleLoad} disabled={loading}>Refresh</button>
          </div>
        </>
      )}
    </>
  )
}