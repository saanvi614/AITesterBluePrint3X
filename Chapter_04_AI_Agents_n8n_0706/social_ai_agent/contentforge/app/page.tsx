'use client';

import { useState, useEffect, useCallback } from 'react';
import { ContentRow, PipelineState } from '@/lib/types';
import { StatusCards }   from '@/components/StatusCards';
import { ContentTabs }   from '@/components/ContentTabs';
import { CalendarTable } from '@/components/CalendarTable';
import { ExcelLog }      from '@/components/ExcelLog';
import { SettingsModal } from '@/components/SettingsModal';

type MainTab  = 'today' | 'calendar' | 'log';
type StatusData = PipelineState & { rowCount?: number; lastModified?: string };

function loadBrowserKeys(): { groq: string; gemini: string } {
  if (typeof window === 'undefined') return { groq: '', gemini: '' };
  return {
    groq:   localStorage.getItem('cf_groq_key')   ?? '',
    gemini: localStorage.getItem('cf_gemini_key') ?? '',
  };
}

export default function DashboardPage() {
  const [mainTab,       setMainTab]       = useState<MainTab>('today');
  const [today,         setToday]         = useState<ContentRow | null>(null);
  const [calendar,      setCalendar]      = useState<ContentRow[]>([]);
  const [status,        setStatus]        = useState<StatusData | null>(null);
  const [running,       setRunning]       = useState(false);
  const [runMsg,        setRunMsg]        = useState('');
  const [showSettings,  setShowSettings]  = useState(false);
  const [browserKeys,   setBrowserKeys]   = useState({ groq: '', gemini: '' });
  // null = unknown, true/false = last validation result
  const [keyStatus,     setKeyStatus]     = useState<{ groqOk: boolean; geminiOk: boolean } | null>(null);

  // Load keys from localStorage on mount
  useEffect(() => {
    const keys = loadBrowserKeys();
    setBrowserKeys(keys);
    if (keys.groq && keys.gemini) {
      fetch('/api/validate-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groqKey: keys.groq, geminiKey: keys.gemini }),
      })
        .then((r) => r.json())
        .then((d) => setKeyStatus({ groqOk: !!d.groqOk, geminiOk: !!d.geminiOk }))
        .catch(() => setKeyStatus({ groqOk: false, geminiOk: false }));
    }
  }, []);

  const apiHeaders = useCallback((): HeadersInit => {
    const h: Record<string, string> = {};
    if (browserKeys.groq)   h['x-groq-key']   = browserKeys.groq;
    if (browserKeys.gemini) h['x-gemini-key']  = browserKeys.gemini;
    return h;
  }, [browserKeys]);

  const effectiveStatus: StatusData | null = status
    ? {
        ...status,
        groqKeyOk:   keyStatus ? keyStatus.groqOk   : (status.groqKeyOk   ?? false),
        geminiKeyOk: keyStatus ? keyStatus.geminiOk : (status.geminiKeyOk ?? false),
      }
    : null;

  const keysReady = keyStatus?.groqOk && keyStatus?.geminiOk;

  const fetchStatus = useCallback(async () => {
    try {
      const r = await fetch('/api/status');
      if (r.ok) setStatus(await r.json());
    } catch {}
  }, []);

  const fetchToday = useCallback(async () => {
    try {
      const r = await fetch('/api/today');
      if (r.ok) {
        const data = await r.json();
        setToday(data.row);
      }
    } catch {}
  }, []);

  const fetchCalendar = useCallback(async () => {
    try {
      const r = await fetch('/api/calendar');
      if (r.ok) {
        const data = await r.json();
        setCalendar(data.rows ?? []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchToday();
    fetchCalendar();
  }, [fetchStatus, fetchToday, fetchCalendar]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchStatus();
      fetchToday();
      if (mainTab === 'calendar' || mainTab === 'log') fetchCalendar();
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchStatus, fetchToday, fetchCalendar, mainTab]);

  const handleRun = async () => {
    if (running) return;
    if (!keysReady) {
      setShowSettings(true);
      return;
    }
    setRunning(true);
    setRunMsg('');
    try {
      const r = await fetch('/api/run', {
        method: 'POST',
        headers: apiHeaders(),
      });
      const data = await r.json();
      if (r.ok) {
        setRunMsg('Pipeline started — watch status cards for progress.');
      } else {
        setRunMsg(data.error ?? 'Failed to start pipeline');
      }
    } catch {
      setRunMsg('Network error');
    }
    setRunning(false);
    setTimeout(() => setRunMsg(''), 5000);
  };

  const handleKeysSaved = (groq: string, gemini: string) => {
    setBrowserKeys({ groq, gemini });
    setKeyStatus({ groqOk: true, geminiOk: true });
  };

  const handleKeysCleared = () => {
    setBrowserKeys({ groq: '', gemini: '' });
    setKeyStatus(null);
  };

  const MAIN_TABS: { key: MainTab; label: string }[] = [
    { key: 'today',    label: "Today's Content" },
    { key: 'calendar', label: 'Calendar' },
    { key: 'log',      label: 'Excel Log' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Settings modal */}
      {showSettings && (
        <SettingsModal
          initialGroq={browserKeys.groq}
          initialGemini={browserKeys.gemini}
          onClose={() => setShowSettings(false)}
          onSaved={handleKeysSaved}
          onCleared={handleKeysCleared}
        />
      )}

      {/* Top header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
              CF
            </div>
            <span className="font-semibold text-white">ContentForge</span>
            {status?.running && (
              <span className="flex items-center gap-1.5 text-xs text-blue-400">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                {status.currentStep ?? 'Running'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {runMsg && (
              <span className="text-xs text-gray-400">{runMsg}</span>
            )}

            {/* Settings button */}
            <button
              onClick={() => setShowSettings(true)}
              title="API Key Settings"
              className={`p-2 rounded-lg border transition-colors ${
                keysReady
                  ? 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                  : 'border-amber-500/50 text-amber-400 hover:border-amber-400'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            <button
              onClick={handleRun}
              disabled={running || status?.running}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              {(running || status?.running) ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {keysReady ? 'Run Pipeline Now' : 'Configure Keys First'}
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        <StatusCards
          today={today}
          status={effectiveStatus}
          onSettingsClick={() => setShowSettings(true)}
        />

        <div>
          <div className="flex border-b border-gray-800 mb-4">
            {MAIN_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setMainTab(tab.key);
                  if (tab.key !== 'today') fetchCalendar();
                }}
                className={`px-5 py-3 text-sm font-medium transition-colors ${
                  mainTab === tab.key
                    ? 'text-sky-400 border-b-2 border-sky-400'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {mainTab === 'today'    && <ContentTabs row={today} />}
          {mainTab === 'calendar' && <CalendarTable rows={calendar} />}
          {mainTab === 'log'      && (
            <ExcelLog
              rows={calendar}
              lastModified={status?.lastModified ?? null}
              rowCount={status?.rowCount ?? 0}
            />
          )}
        </div>
      </main>

      <footer className="border-t border-gray-800 py-4 text-center text-xs text-gray-600">
        ContentForge — Groq + Gemini + ExcelJS pipeline
      </footer>
    </div>
  );
}
