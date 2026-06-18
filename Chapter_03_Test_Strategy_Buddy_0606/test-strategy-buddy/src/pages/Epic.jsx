import { useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { useApp } from '../context/AppContext'
import { generateEpicContent } from '../services/groqService'
import { createEpic } from '../services/jiraService'
import { fetchSUT } from '../services/sutService'

export default function Epic() {
  const { settings } = useSettings()
  const { epicKey, saveEpic, clearEpic } = useApp()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [preview, setPreview] = useState(null)
  const [created, setCreated] = useState(null)

  const handleGenerate = async () => {
    if (epicKey) {
      setError(`Epic ${epicKey} already exists. Only one Epic can be created per session. Clear it first to start over.`)
      return
    }
    setLoading(true)
    setError(null)
    setPreview(null)
    try {
      const sutContent = await fetchSUT(settings.sutUrl)
      const data = await generateEpicContent(settings, sutContent)
      setPreview(data)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const handleCreate = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await createEpic(settings, preview)
      setCreated(result)
      saveEpic({ id: result.id, key: result.key, summary: preview.summary })
      setPreview(null)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const handleClear = () => {
    clearEpic()
    setCreated(null)
    setPreview(null)
    setError(null)
  }

  return (
    <>
      <div className="page-header">
        <h1>Create Epic</h1>
        <p>Generates a JIRA Epic from the SUT home page content. One-time activity per session.</p>
      </div>

      {epicKey && !created && (
        <div className="epic-banner">
          <span>Active Epic:</span>
          <strong>{epicKey}</strong>
          <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }} onClick={handleClear}>
            Clear &amp; Start Over
          </button>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {!epicKey && !preview && (
        <div className="card">
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            The app will fetch <strong>{settings.sutUrl}</strong>, extract page content, and send it to GROQ to generate an Epic.
          </p>
          <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
            {loading ? <><span className="spinner" /> Fetching SUT &amp; Generating…</> : 'Generate Epic'}
          </button>
        </div>
      )}

      {preview && (
        <div className="card">
          <div className="card-title">Preview — Review before creating in JIRA</div>
          <div className="form-group">
            <label className="form-label">Summary</label>
            <input className="form-input" value={preview.summary} onChange={e => setPreview(p => ({ ...p, summary: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={preview.description} onChange={e => setPreview(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Acceptance Criteria</label>
            <textarea className="form-textarea" value={preview.acceptanceCriteria} onChange={e => setPreview(p => ({ ...p, acceptanceCriteria: e.target.value }))} />
          </div>
          <div className="action-row">
            <button className="btn btn-primary" onClick={handleCreate} disabled={loading}>
              {loading ? <><span className="spinner" /> Creating in JIRA…</> : 'Create Epic in JIRA'}
            </button>
            <button className="btn btn-secondary" onClick={() => setPreview(null)} disabled={loading}>Discard</button>
          </div>
        </div>
      )}

      {created && (
        <div className="alert alert-success">
          Epic <strong>{created.key}</strong> created successfully in JIRA.{' '}
          <a href={`${settings.jiraBaseUrl}browse/${created.key}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>
            View in JIRA →
          </a>
        </div>
      )}
    </>
  )
}
