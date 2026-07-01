import { useState } from 'react';
import { saveConfig, loadConfig } from '../lib/api.js';

export default function Settings({ config, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState({ ...config });

  function handleChange(key, value) {
    setLocal((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    saveConfig(local);
    onUpdate(local);
    setOpen(false);
  }

  function handleClearAndReload() {
    localStorage.removeItem('fta_config');
    window.location.reload();
  }

  const baseUrlWarning = local.baseUrl.trim() !== '';

  return (
    <div className="settings-container">
      <button
        className={`settings-toggle ${baseUrlWarning ? 'settings-toggle-warn' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        ⚙ Connection {baseUrlWarning ? '⚠' : ''} {open ? '▲' : '▼'}
      </button>

      {open && (
        <div className="settings-panel">
          <div className="settings-field">
            <label>LangFlow Base URL</label>
            <input
              type="text"
              value={local.baseUrl}
              onChange={(e) => handleChange('baseUrl', e.target.value)}
              autoComplete="off"
              spellCheck={false}
              placeholder="(blank = use Vite proxy)"
            />
            {baseUrlWarning ? (
              <small className="warn-text">
                ⚠ Non-empty Base URL bypasses the Vite proxy — browser will hit LangFlow directly and get a CORS error. <strong>Clear this field</strong> for local dev.
              </small>
            ) : (
              <small className="ok-text">✓ Blank — requests go through Vite proxy (no CORS)</small>
            )}
          </div>

          <Field
            label="x-api-key"
            hint="Never commit this. Stored in localStorage only."
            value={local.apiKey}
            type="password"
            onChange={(v) => handleChange('apiKey', v)}
          />
          <Field
            label="Flow ID"
            value={local.flowId}
            onChange={(v) => handleChange('flowId', v)}
          />
          <Field
            label="File Component ID — Build A"
            value={local.fileIdA}
            onChange={(v) => handleChange('fileIdA', v)}
          />
          <Field
            label="File Component ID — Build B"
            value={local.fileIdB}
            onChange={(v) => handleChange('fileIdB', v)}
          />
          <Field
            label="Session ID"
            value={local.sessionId}
            onChange={(v) => handleChange('sessionId', v)}
          />
          <div className="settings-field">
            <label>Prompt</label>
            <textarea
              rows={3}
              value={local.prompt}
              onChange={(e) => handleChange('prompt', e.target.value)}
            />
          </div>

          <div className="settings-actions">
            <button className="btn-primary" onClick={handleSave}>Save</button>
            <button
              className="btn-danger"
              onClick={handleClearAndReload}
              title="Wipes all saved settings from localStorage and reloads"
            >
              🗑 Clear All &amp; Reload
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, hint, value, type = 'text', onChange }) {
  return (
    <div className="settings-field">
      <label>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        spellCheck={false}
      />
      {hint && <small>{hint}</small>}
    </div>
  );
}
