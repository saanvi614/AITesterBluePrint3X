import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const CARDS = [
  {
    path: '/epic',
    icon: '🏔️',
    title: 'Epic',
    desc: 'Create a JIRA Epic for the SUT. One-time activity per session.',
    alwaysEnabled: true,
    badge: 'Step 1',
  },
  {
    path: '/child-item',
    icon: '📋',
    title: 'Child Item',
    desc: 'Generate and create User Stories, Tasks, and Bugs under the Epic.',
    requiresEpic: true,
    badge: 'Step 2',
  },
  {
    path: '/hltp',
    icon: '📑',
    title: 'HLTP',
    desc: 'Create a High-Level Test Plan covering Positive, Negative, Performance, and Edge scenarios.',
    requiresEpic: true,
    badge: 'Step 3',
  },
  {
    path: '/test-strategy',
    icon: '🧭',
    title: 'Test Strategy',
    desc: 'Generate a full Test Strategy following B.L.A.S.T. framework and RICE-POT method.',
    alwaysEnabled: true,
    badge: 'Step 4',
  },
  {
    path: '/test-case',
    icon: '🧪',
    title: 'Test Cases',
    desc: 'Generate detailed test cases for a User Story with steps and expected results.',
    alwaysEnabled: true,
    badge: 'Step 5',
  },
  {
    path: '/test-execution',
    icon: '▶️',
    title: 'Test Execution',
    desc: 'View test execution summary — pass, fail, blocked, skipped.',
    alwaysEnabled: true,
    badge: 'Step 6',
  },
  {
    path: '/dashboard',
    icon: '📊',
    title: 'Dashboard',
    desc: 'At-a-glance view of Epic status, child item counts, HLTP coverage, and execution stats.',
    alwaysEnabled: true,
    badge: 'Step 7',
  },
]

export default function Home() {
  const { epicKey, epicSummary } = useApp()

  return (
    <>
      <div className="page-header">
        <h1>Test Strategy Buddy</h1>
        <p>End-to-end JIRA test planning powered by B.L.A.S.T. framework and RICE-POT methodology.</p>
      </div>

      {epicKey && (
        <div className="epic-banner">
          <span>Active Epic:</span>
          <strong>{epicKey}</strong>
          <span style={{ color: 'var(--text-muted)' }}>—</span>
          <span>{epicSummary}</span>
        </div>
      )}

      {!epicKey && (
        <div className="alert alert-info">
          No Epic created yet. Start with <strong>Step 1: Epic</strong> to unlock Child Item and HLTP creation.
        </div>
      )}

      <div className="home-grid">
        {CARDS.map(card => {
          const enabled = card.alwaysEnabled || (card.requiresEpic && !!epicKey)
          return enabled ? (
            <Link key={card.path} to={card.path} className="home-card">
              <div className="home-card-icon">{card.icon}</div>
              <div className="home-card-title">{card.title}</div>
              <div className="home-card-desc">{card.desc}</div>
              <span className="home-card-badge">{card.badge}</span>
            </Link>
          ) : (
            <div key={card.path} className="home-card home-card--disabled">
              <div className="home-card-icon">{card.icon}</div>
              <div className="home-card-title">{card.title}</div>
              <div className="home-card-desc">{card.desc}</div>
              <span className="home-card-badge home-card-badge--disabled">Requires Epic</span>
            </div>
          )
        })}
      </div>
    </>
  )
}
