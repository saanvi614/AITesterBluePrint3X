import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { useApp } from '../context/AppContext'
import { generateChildItems } from '../services/groqService'
import { createChildItem, getIssue } from '../services/jiraService'
import { fetchSUT } from '../services/sutService'

export default function ChildItem() {
  const { settings } = useSettings()
  const { epicKey, epicSummary } = useApp()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [created, setCreated] = useState([])
  const [creating, setCreating] = useState(null)

  if (!epicKey) {
    return (
      <>
        <div className="page-header"><h1>Create Child Item</h1></div>
        <div className="alert alert-error">Epic not found. <button className="btn btn-secondary btn-sm" onClick={() => navigate('/epic')}>Create Epic first</button></div>
      </>
    )
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setSuggestions([])
    try {
      const issue = await getIssue(settings, epicKey)
      const desc = issue.fields?.description?.content?.[0]?.content?.[0]?.text || epicSummary
      const sutContent = await fetchSUT(settings.sutUrl)
      const items = await generateChildItems(settings, epicSummary, desc, sutContent)
      setSuggestions(items.map((item, i) => ({ ...item, _id: i, selected: true })))
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const toggleSelect = (id) => {
    setSuggestions(s => s.map(item => item._id === id ? { ...item, selected: !item.selected } : item))
  }

  const handleCreateAll = async () => {
    const selected = suggestions.filter(s => s.selected)
    setCreating('all')
    setError(null)
    const results = []
    for (const item of selected) {
      try {
        const result = await createChildItem(settings, { ...item, epicKey })
        results.push({ key: result.key, summary: item.summary, issueType: item.issueType, ok: true })
      } catch (err) {
        results.push({ key: null, summary: item.summary, issueType: item.issueType, ok: false, error: err.message })
      }
    }
    setCreated(prev => [...prev, ...results])
    setSuggestions([])
    setCreating(null)
  }

  return (
    <>
      <div className="page-header">
        <h1>Create Child Items</h1>
        <p>Generate and create User Stories, Tasks, and Bugs under Epic <strong>{epicKey}</strong>.</p>
      </div>

      <div className="epic-banner">
        <span>Active Epic:</span> <strong>{epicKey}</strong> <span style={{ color: 'var(--text-muted)' }}>— {epicSummary}</span>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {suggestions.length === 0 && created.length === 0 && (
        <div className="card">
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            GROQ will analyse the Epic description and SUT content to suggest relevant child items. You can review and deselect before creating.
          </p>
          <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
            {loading ? <><span className="spinner" /> Generating suggestions…</> : 'Generate Child Item Suggestions'}
          </button>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="card">
          <div className="card-title">Suggested Child Items — deselect any you don't want</div>
          <ul className="item-list" style={{ marginBottom: 16 }}>
            {suggestions.map(item => (
              <li key={item._id} style={{ cursor: 'pointer' }} onClick={() => toggleSelect(item._id)}>
                <input type="checkbox" checked={item.selected} onChange={() => toggleSelect(item._id)} onClick={e => e.stopPropagation()} />
                <span className="item-type">{item.issueType}</span>
                <span>{item.summary}</span>
              </li>
            ))}
          </ul>
          <div className="action-row">
            <button className="btn btn-primary" onClick={handleCreateAll} disabled={creating === 'all'}>
              {creating === 'all' ? <><span className="spinner" /> Creating…</> : `Create ${suggestions.filter(s => s.selected).length} Selected Items`}
            </button>
            <button className="btn btn-secondary" onClick={handleGenerate} disabled={loading}>Re-generate</button>
          </div>
        </div>
      )}

      {created.length > 0 && (
        <div className="card">
          <div className="card-title">Created Items</div>
          <ul className="item-list">
            {created.map((item, i) => (
              <li key={i}>
                {item.ok
                  ? <a href={`${settings.jiraBaseUrl}browse/${item.key}`} target="_blank" rel="noreferrer" className="item-key">{item.key}</a>
                  : <span style={{ color: 'var(--danger)' }}>Failed</span>
                }
                <span className="item-type">{item.issueType}</span>
                <span>{item.summary}</span>
                {!item.ok && <span style={{ color: 'var(--danger)', fontSize: 11 }}>{item.error}</span>}
              </li>
            ))}
          </ul>
          <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={handleGenerate} disabled={loading}>
            Generate More
          </button>
        </div>
      )}
    </>
  )
}
