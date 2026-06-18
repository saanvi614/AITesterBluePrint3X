import { useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { useApp } from '../context/AppContext'
import { generateTestStrategy } from '../services/groqService'
import { fetchSUT } from '../services/sutService'
import { exportTestStrategyDocx } from '../services/exportService'

export default function TestStrategy() {
  const { settings } = useSettings()
  const { epicKey, epicSummary } = useApp()
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState(null)
  const [strategy, setStrategy] = useState('')

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setStrategy('')
    try {
      const sutContent = await fetchSUT(settings.sutUrl)
      const desc = epicSummary || 'Online training course platform'
      const result = await generateTestStrategy(settings, epicSummary || 'Testing Academy Platform', desc, sutContent)
      setStrategy(result)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      await exportTestStrategyDocx(strategy, 'TestStrategy_BLAST.docx')
    } catch (err) {
      setError(`Export failed: ${err.message}`)
    }
    setExporting(false)
  }

  const renderStrategy = (text) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h3 key={i} style={{ color: 'var(--accent)', marginTop: 20, marginBottom: 6, fontSize: 14 }}>{line.replace('## ', '')}</h3>
      if (line.startsWith('# ')) return <h2 key={i} style={{ color: 'var(--text)', marginTop: 24, marginBottom: 8, fontSize: 16 }}>{line.replace('# ', '')}</h2>
      if (line.trim() === '') return <br key={i} />
      return <p key={i} style={{ fontSize: 13, marginBottom: 4, color: 'var(--text)' }}>{line}</p>
    })
  }

  return (
    <>
      <div className="page-header">
        <h1>Test Strategy</h1>
        <p>Generates a comprehensive Test Strategy following B.L.A.S.T. framework and RICE-POT methodology.</p>
      </div>

      {epicKey && (
        <div className="epic-banner">
          <span>Context Epic:</span> <strong>{epicKey}</strong> <span style={{ color: 'var(--text-muted)' }}>— {epicSummary}</span>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="tags" style={{ marginBottom: 16 }}>
          <span className="tag">B.L.A.S.T. Framework</span>
          <span className="tag">RICE-POT Methodology</span>
          <span className="tag">Formal & Technical</span>
          <span className="tag">7 Mandatory Sections</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          Covers: Scope & Objectives · Test Approach (B.L.A.S.T.) · Testing Types · Entry/Exit Criteria · Risk & Mitigation · Tools & Environment · Roles & Responsibilities
        </p>
        <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
          {loading ? <><span className="spinner" /> Generating Test Strategy…</> : 'Generate Test Strategy'}
        </button>
      </div>

      {strategy && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="card-title" style={{ marginBottom: 0 }}>Test Strategy Document</div>
            <button className="btn btn-secondary btn-sm" onClick={handleExport} disabled={exporting}>
              {exporting ? <><span className="spinner" /> Exporting…</> : '⬇ Download .docx'}
            </button>
          </div>
          <div className="output-box" style={{ maxHeight: 600 }}>
            {renderStrategy(strategy)}
          </div>
          <div className="action-row">
            <button className="btn btn-secondary btn-sm" onClick={handleExport} disabled={exporting}>
              {exporting ? <><span className="spinner" /> Exporting…</> : '⬇ Download as .docx'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
