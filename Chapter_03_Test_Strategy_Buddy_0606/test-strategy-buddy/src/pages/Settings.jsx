import { useState } from 'react'
import { useSettings } from '../context/SettingsContext'

export default function Settings() {
  const { settings, saveSettings } = useSettings()
  const [form, setForm] = useState({ ...settings })
  const [saved, setSaved] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = (e) => {
    e.preventDefault()
    saveSettings(form)
    setSaved(true)
    setTestResult(null)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleTestJira = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const token = btoa(`${form.jiraEmail}:${form.jiraApiToken}`)
      let res
      if (import.meta.env.DEV) {
        res = await fetch('/jira-api/rest/api/3/myself', {
          headers: { 'Authorization': `Basic ${token}`, 'Accept': 'application/json' },
        })
      } else {
        res = await fetch('/api/jira', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jiraBase: form.jiraBaseUrl.replace(/\/$/, ''),
            jiraAuth: `Basic ${token}`,
            method: 'GET',
            jiraPath: '/rest/api/3/myself',
          }),
        })
      }
      if (res.ok) {
        const data = await res.json()
        setTestResult({ ok: true, msg: `JIRA connected as: ${data.displayName} (${data.emailAddress})` })
      } else {
        setTestResult({ ok: false, msg: `JIRA returned ${res.status}. Check your credentials.` })
      }
    } catch (err) {
      setTestResult({ ok: false, msg: `Connection failed: ${err.message}` })
    }
    setTesting(false)
  }

  return (
    <>
      <div className="page-header">
        <h1>Settings</h1>
        <p>Configure JIRA and GROQ credentials. Stored locally in your browser only — never committed to the repo.</p>
      </div>

      <form onSubmit={handleSave}>
        <div className="card">
          <div className="card-title">JIRA Configuration</div>
          <div className="settings-grid">
            <div className="form-group">
              <label className="form-label">JIRA Base URL</label>
              <input className="form-input" value={form.jiraBaseUrl} onChange={e => set('jiraBaseUrl', e.target.value)} placeholder="https://yourorg.atlassian.net/" />
            </div>
            <div className="form-group">
              <label className="form-label">JIRA Email</label>
              <input className="form-input" type="email" value={form.jiraEmail} onChange={e => set('jiraEmail', e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">JIRA API Token</label>
              <input className="form-input" type="password" value={form.jiraApiToken} onChange={e => set('jiraApiToken', e.target.value)} placeholder="Atlassian API token" />
              <p className="form-hint">Generate at: id.atlassian.com → Security → API tokens</p>
            </div>
          </div>
          <div className="action-row">
            <button type="button" className="btn btn-secondary" onClick={handleTestJira} disabled={testing}>
              {testing ? <><span className="spinner" /> Testing…</> : 'Test JIRA Connection'}
            </button>
          </div>
          {testResult && (
            <div className={`alert ${testResult.ok ? 'alert-success' : 'alert-error'}`} style={{ marginTop: 12 }}>
              {testResult.msg}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">GROQ (AI) Configuration</div>
          <div className="settings-grid">
            <div className="form-group">
              <label className="form-label">GROQ API Key</label>
              <input className="form-input" type="password" value={form.groqApiKey} onChange={e => set('groqApiKey', e.target.value)} placeholder="gsk_..." />
              <p className="form-hint">Get your key at: console.groq.com</p>
            </div>
            <div className="form-group">
              <label className="form-label">Model</label>
              <input className="form-input" value={form.groqModel} onChange={e => set('groqModel', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">System Under Test</div>
          <div className="form-group">
            <label className="form-label">SUT URL</label>
            <input className="form-input" value={form.sutUrl} onChange={e => set('sutUrl', e.target.value)} />
          </div>
        </div>

        {saved && <div className="alert alert-success">Settings saved successfully.</div>}
        <button type="submit" className="btn btn-primary">Save Settings</button>
      </form>
    </>
  )
}
