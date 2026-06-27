'use client';

import { useState } from 'react';

interface Props {
  initialGroq:   string;
  initialGemini: string;
  onClose:  () => void;
  onSaved:  (groqKey: string, geminiKey: string) => void;
  onCleared: () => void;
}

interface TestResult {
  groqOk:   boolean;
  geminiOk: boolean;
}

export function SettingsModal({ initialGroq, initialGemini, onClose, onSaved, onCleared }: Props) {
  const [groq,        setGroq]        = useState(initialGroq);
  const [gemini,      setGemini]      = useState(initialGemini);
  const [showGroq,    setShowGroq]    = useState(false);
  const [showGemini,  setShowGemini]  = useState(false);
  const [testing,     setTesting]     = useState(false);
  const [result,      setResult]      = useState<TestResult | null>(null);
  const [error,       setError]       = useState('');

  const resetResult = () => setResult(null);

  const handleTest = async () => {
    const g = groq.trim();
    const m = gemini.trim();
    if (!g || !m) { setError('Both keys are required'); return; }
    setTesting(true);
    setError('');
    setResult(null);
    try {
      const r = await fetch('/api/validate-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groqKey: g, geminiKey: m }),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error ?? 'Validation failed'); return; }
      setResult({ groqOk: data.groqOk, geminiOk: data.geminiOk });
      if (!data.groqOk || !data.geminiOk) {
        setError('One or more keys are invalid — fix them before saving.');
      }
    } catch {
      setError('Network error — check connection');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    if (!result?.groqOk || !result?.geminiOk) return;
    localStorage.setItem('cf_groq_key',   groq.trim());
    localStorage.setItem('cf_gemini_key', gemini.trim());
    onSaved(groq.trim(), gemini.trim());
    onClose();
  };

  const handleClear = () => {
    localStorage.removeItem('cf_groq_key');
    localStorage.removeItem('cf_gemini_key');
    setGroq('');
    setGemini('');
    setResult(null);
    setError('');
    onCleared();
    onClose();
  };

  const bothValid = result?.groqOk && result?.geminiOk;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <h2 className="text-white font-semibold">API Key Settings</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-xs text-gray-400 mb-5">
          Keys are stored in your browser only — never sent to any server except the AI providers during validation and pipeline runs.
        </p>

        <div className="space-y-4">
          {/* GROQ Key */}
          <div>
            <label className="flex items-center gap-2 text-xs text-gray-400 mb-1.5">
              Groq API Key
              {result && (
                <span className={`font-medium ${result.groqOk ? 'text-green-400' : 'text-red-400'}`}>
                  {result.groqOk ? '✓ Valid' : '✗ Invalid'}
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={showGroq ? 'text' : 'password'}
                value={groq}
                onChange={(e) => { setGroq(e.target.value); resetResult(); }}
                placeholder="gsk_..."
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2.5 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
              <button type="button" onClick={() => setShowGroq(!showGroq)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs">
                {showGroq ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-1">console.groq.com/keys</p>
          </div>

          {/* Gemini Key */}
          <div>
            <label className="flex items-center gap-2 text-xs text-gray-400 mb-1.5">
              Gemini API Key
              {result && (
                <span className={`font-medium ${result.geminiOk ? 'text-green-400' : 'text-red-400'}`}>
                  {result.geminiOk ? '✓ Valid' : '✗ Invalid'}
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={showGemini ? 'text' : 'password'}
                value={gemini}
                onChange={(e) => { setGemini(e.target.value); resetResult(); }}
                placeholder="AIzaSy..."
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2.5 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
              <button type="button" onClick={() => setShowGemini(!showGemini)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs">
                {showGemini ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-1">aistudio.google.com/app/apikey</p>
          </div>

          {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

          {bothValid && (
            <p className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
              Both keys valid — click Save to store in browser.
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleTest}
              disabled={testing || !groq.trim() || !gemini.trim()}
              className="flex-1 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              {testing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Testing...
                </span>
              ) : 'Test Keys'}
            </button>
            <button
              onClick={handleSave}
              disabled={!bothValid}
              className="flex-1 py-2.5 rounded-lg bg-green-700 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              Save
            </button>
          </div>

          <button
            onClick={handleClear}
            className="w-full py-2 rounded-lg border border-gray-700 hover:border-gray-500 text-gray-500 hover:text-gray-300 text-xs transition-colors"
          >
            Clear saved keys
          </button>
        </div>
      </div>
    </div>
  );
}
