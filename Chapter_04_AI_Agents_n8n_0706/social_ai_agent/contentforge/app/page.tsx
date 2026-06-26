'use client';

import { useState, useEffect, useCallback } from 'react';
import { ContentRow, PipelineState } from '@/lib/types';
import { StatusCards } from '@/components/StatusCards';
import { ContentTabs } from '@/components/ContentTabs';
import { CalendarTable } from '@/components/CalendarTable';
import { ExcelLog } from '@/components/ExcelLog';

type MainTab = 'today' | 'calendar' | 'log';

type StatusData = PipelineState & { rowCount?: number; lastModified?: string };

export default function DashboardPage() {
  const [mainTab, setMainTab]     = useState<MainTab>('today');
  const [today, setToday]         = useState<ContentRow | null>(null);
  const [calendar, setCalendar]   = useState<ContentRow[]>([]);
  const [status, setStatus]       = useState<StatusData | null>(null);
  const [running, setRunning]     = useState(false);
  const [runMsg, setRunMsg]       = useState('');

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

  // Initial load
  useEffect(() => {
    fetchStatus();
    fetchToday();
    fetchCalendar();
  }, [fetchStatus, fetchToday, fetchCalendar]);

  // Polling every 4 seconds
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
    setRunning(true);
    setRunMsg('');
    try {
      const r = await fetch('/api/run', { method: 'POST' });
      const data = await r.json();
      if (r.ok) {
        setRunMsg('Pipeline started — watch status cards for progress.');
      } else {
        setRunMsg(data.error ?? 'Failed to start pipeline');
      }
    } catch (e) {
      setRunMsg('Network error');
    }
    setRunning(false);
    setTimeout(() => setRunMsg(''), 5000);
  };

  const MAIN_TABS: { key: MainTab; label: string }[] = [
    { key: 'today',    label: "Today's Content" },
    { key: 'calendar', label: 'Calendar' },
    { key: 'log',      label: 'Excel Log' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
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
          <div className="flex items-center gap-3">
            {runMsg && (
              <span className="text-xs text-gray-400">{runMsg}</span>
            )}
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
                  Run Pipeline Now
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Status cards */}
        <StatusCards today={today} status={status} />

        {/* Main tabs */}
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

          {mainTab === 'today' && <ContentTabs row={today} />}
          {mainTab === 'calendar' && <CalendarTable rows={calendar} />}
          {mainTab === 'log' && (
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
