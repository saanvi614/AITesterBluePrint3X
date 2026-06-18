import { useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { generateTestCases } from '../services/groqService'
import { getIssue, addComment } from '../services/jiraService'
import { exportTestCasesCSV } from '../services/exportService'

export default function TestCase() {
  const { settings } = useSettings()
  const [jiraId, setJiraId] = useState('')
  const [loading, setLoading] = useState(false)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState(null)
  const [testCases, setTestCases] = useState([])
  const [posted, setPosted] = useState(false)
  const [storyInfo, setStoryInfo] = useState(null)

  const handleGenerate = async () => {
    if (!jiraId.trim()) { setError('JIRA ID is required.'); return }
    setLoading(true)
    setError(null)
    setTestCases([])
    setPosted(false)
    setStoryInfo(null)
    try {
      const issue = await getIssue(settings, jiraId.trim())
      const summary = issue.fields?.summary || ''
      const descContent = issue.fields?.description?.content || []
      const description = descContent.flatMap(b => b.content?.map(c => c.text) || []).join(' ')
      const acBlock = descContent.find(b => b.content?.some(c => c.text?.includes('Acceptance Criteria')))
      const ac = acBlock?.content?.map(c => c.text).join('\n') || description

      setStoryInfo({ key: issue.key, summary, type: issue.fields?.issuetype?.name })

      const cases = await generateTestCases(settings, issue.key, summary, description, ac)
      const valid = cases.filter(tc => Array.isArray(tc.steps) && tc.steps.length > 0)
      if (valid.length < cases.length) {
        setError(`${cases.length - valid.length} test case(s) were discarded — missing steps (Anti-Hallucination Rule).`)
      }
      setTestCases(valid)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const handlePostToJira = async () => {
    setPosting(true)
    try {
      const body = testCases.map(tc =>
        `[${tc.id}] ${tc.title} (${tc.type})\nSteps:\n${tc.steps.map((s, i) => `  ${i + 1}. ${s}`).join('\n')}\nExpected: ${tc.expectedResult}`
      ).join('\n\n---\n\n')
      await addComment(settings, jiraId.trim(), `=== TEST CASES ===\n\n${body}`)
      setPosted(true)
    } catch (err) {
      setError(err.message)
    }
    setPosting(false)
  }

  const handleExportCSV = () => {
    try {
      exportTestCasesCSV(testCases, `TestCases_${jiraId.trim()}.csv`)
    } catch (err) {
      setError(`Export failed: ${err.message}`)
    }
  }

  const BADGE = { Positive: 'tc-badge-Positive', Negative: 'tc-badge-Negative', Performance: 'tc-badge-Performance', Edge: 'tc-badge-Edge' }

  const grouped = ['Positive', 'Negative', 'Performance', 'Edge'].map(type => ({
    type,
    cases: testCases.filter(tc => tc.type === type),
  })).filter(g => g.cases.length > 0)

  return (
    <>
      <div className="page-header">
        <h1>Test Cases</h1>
        <p>Generate detailed test cases for a User Story. All cases include test steps and expected results.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="form-group">
          <label className="form-label">User Story JIRA ID</label>
          <input className="form-input" value={jiraId} onChange={e => { setJiraId(e.target.value); setError(null) }} placeholder="e.g. SCRUM-3" />
          <p className="form-hint">Enter the JIRA ID of the User Story to generate test cases for.</p>
        </div>
        <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
          {loading ? <><span className="spinner" /> Fetching story &amp; generating…</> : 'Generate Test Cases'}
        </button>
      </div>

      {storyInfo && (
        <div className="epic-banner">
          <strong>{storyInfo.key}</strong>
          <span className="item-type">{storyInfo.type}</span>
          <span>{storyInfo.summary}</span>
        </div>
      )}

      {testCases.length > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{testCases.length} test cases generated</span>
            <div className="action-row" style={{ margin: 0 }}>
              <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>⬇ Download .csv</button>
              <button className="btn btn-primary btn-sm" onClick={handlePostToJira} disabled={posting || posted}>
                {posting ? <><span className="spinner" /></> : posted ? 'Posted to JIRA' : 'Post to JIRA'}
              </button>
            </div>
          </div>

          {posted && <div className="alert alert-success">Test cases posted as a comment on {jiraId.trim()}.</div>}

          {grouped.map(group => (
            <div key={group.type} style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {group.type} Scenarios ({group.cases.length})
              </h3>
              {group.cases.map(tc => (
                <div key={tc.id} className="tc-card">
                  <div className="tc-card-header">
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{tc.id}</span>
                    <span className={`tc-badge ${BADGE[tc.type] || ''}`}>{tc.type}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{tc.title}</span>
                  </div>
                  <ol className="tc-steps">
                    {tc.steps.map((step, i) => <li key={i}>{step}</li>)}
                  </ol>
                  <p className="tc-expected"><span>Expected: </span>{tc.expectedResult}</p>
                </div>
              ))}
            </div>
          ))}

          <div className="action-row">
            <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>⬇ Download .csv</button>
            <button className="btn btn-primary btn-sm" onClick={handlePostToJira} disabled={posting || posted}>
              {posting ? <><span className="spinner" /> Posting…</> : posted ? 'Posted to JIRA' : 'Post to JIRA'}
            </button>
          </div>
        </>
      )}
    </>
  )
}
