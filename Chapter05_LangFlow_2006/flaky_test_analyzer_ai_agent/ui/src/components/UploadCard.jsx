import { useRef, useState } from 'react';
import { parsePlaywrightResults } from '../lib/playwright.js';

export default function UploadCard({ label, file, stats, onFile, disabled }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  function handleFiles(files) {
    const f = files[0];
    if (!f) return;
    if (!f.name.endsWith('.json')) {
      setError('Please drop a .json file.');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        const parsed = parsePlaywrightResults(json);
        onFile(f, parsed);
      } catch {
        setError('Could not parse JSON. Is this a Playwright results.json?');
      }
    };
    reader.readAsText(f);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  }

  function onDragOver(e) {
    e.preventDefault();
    if (!disabled) setDragging(true);
  }

  function onDragLeave() {
    setDragging(false);
  }

  function onInputChange(e) {
    handleFiles(e.target.files);
    e.target.value = '';
  }

  return (
    <div
      className={`upload-card ${dragging ? 'drag-over' : ''} ${file ? 'has-file' : ''} ${disabled ? 'disabled' : ''}`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
      aria-label={`Upload ${label}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={onInputChange}
      />

      <div className="upload-card-label">{label}</div>

      {!file && (
        <div className="upload-card-hint">
          <span className="upload-icon">📂</span>
          <span>Drop results.json here<br />or click to browse</span>
        </div>
      )}

      {file && (
        <>
          <div className="upload-filename">{file.name}</div>
          {stats && (
            <div className="upload-stats">
              <Pill color="green" value={stats.passed} label="Passed" />
              <Pill color="red" value={stats.failed} label="Failed" />
              <Pill color="orange" value={stats.flaky} label="Flaky" />
              <Pill color="gray" value={stats.skipped} label="Skipped" />
              <span className="stat-duration">⏱ {stats.duration}</span>
            </div>
          )}
          <button
            className="upload-clear"
            onClick={(e) => { e.stopPropagation(); onFile(null, null); }}
            aria-label="Remove file"
          >
            ✕ Remove
          </button>
        </>
      )}

      {error && <p className="upload-error">{error}</p>}
    </div>
  );
}

function Pill({ color, value, label }) {
  return (
    <span className={`stat-pill pill-${color}`}>
      <strong>{value}</strong> {label}
    </span>
  );
}
