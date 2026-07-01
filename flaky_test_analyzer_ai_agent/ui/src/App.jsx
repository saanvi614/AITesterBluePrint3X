import { useState, useEffect } from 'react';
import UploadCard from './components/UploadCard.jsx';
import Report from './components/Report.jsx';
import Settings from './components/Settings.jsx';
import { analyze, loadConfig } from './lib/api.js';
import './App.css';

function useTheme() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('fta_theme') ?? 'dark'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fta_theme', theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  return { theme, toggle };
}

export default function App() {
  const { theme, toggle } = useTheme();
  const [config, setConfig] = useState(() => loadConfig());

  const [fileA, setFileA] = useState(null);
  const [statsA, setStatsA] = useState(null);
  const [fileB, setFileB] = useState(null);
  const [statsB, setStatsB] = useState(null);

  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  function handleFileA(f, stats) { setFileA(f); setStatsA(stats); }
  function handleFileB(f, stats) { setFileB(f); setStatsB(stats); }

  async function handleRun() {
    if (!fileA || !fileB) return;
    setStatus('loading');
    setResult(null);
    setErrorMsg('');

    try {
      const res = await analyze(fileA, fileB, config, (msg) => setProgress(msg));
      setResult(res);
      setStatus('done');
    } catch (err) {
      setErrorMsg(err.message ?? String(err));
      setStatus('error');
    }
  }

  const canRun = !!fileA && !!fileB && status !== 'loading';

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-top">
          <h1>🔍 Flaky Test Analyzer</h1>
          <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
        <p className="app-subtitle">Upload two Playwright results.json files and let the AI agent identify flaky tests.</p>
      </header>

      <Settings config={config} onUpdate={setConfig} />

      <main className="app-main">
        <div className="upload-row">
          <UploadCard
            label="Build A"
            file={fileA}
            stats={statsA}
            onFile={handleFileA}
            disabled={status === 'loading'}
          />
          <div className="upload-vs">VS</div>
          <UploadCard
            label="Build B"
            file={fileB}
            stats={statsB}
            onFile={handleFileB}
            disabled={status === 'loading'}
          />
        </div>

        <div className="run-row">
          <button
            className="btn-run"
            disabled={!canRun}
            onClick={handleRun}
          >
            {status === 'loading' ? '⏳ Analyzing…' : '▶ Run Analysis'}
          </button>
          {status === 'loading' && <span className="progress-text">{progress}</span>}
        </div>

        {status === 'error' && (
          <div className="error-banner" role="alert">
            <strong>Error:</strong> {errorMsg}
          </div>
        )}

        {status === 'done' && <Report result={result} />}
      </main>

      <footer className="app-footer">
        Powered by LangFlow @created by SwatiJ
      </footer>
    </div>
  );
}
