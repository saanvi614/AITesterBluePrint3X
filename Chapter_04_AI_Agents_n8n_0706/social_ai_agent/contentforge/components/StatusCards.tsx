'use client';

import { ContentRow, PipelineState } from '@/lib/types';

interface Props {
  today: ContentRow | null;
  status: (PipelineState & { rowCount?: number; lastModified?: string }) | null;
  onSettingsClick?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  Pending:  'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  Writing:  'bg-blue-500/20 text-blue-300 border-blue-500/40',
  Imaging:  'bg-purple-500/20 text-purple-300 border-purple-500/40',
  Done:     'bg-green-500/20 text-green-300 border-green-500/40',
  Error:    'bg-red-500/20 text-red-300 border-red-500/40',
};

function ApiKeyBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
      ok
        ? 'bg-green-500/10 text-green-300 border-green-500/30'
        : 'bg-red-500/10 text-red-300 border-red-500/30'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-green-400' : 'bg-red-400'}`} />
      {label}
    </span>
  );
}

function Card({ title, value, sub }: { title: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">{title}</p>
      <div className="text-lg font-semibold text-white">{value}</div>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

export function StatusCards({ today, status, onSettingsClick }: Props) {
  const statusChip = today?.status ? (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[today.status] ?? ''}`}>
      {today.status}
    </span>
  ) : (
    <span className="text-gray-500 text-sm">No content today</span>
  );

  const stepDisplay = status?.running
    ? <span className="text-blue-300 text-sm">{status.currentStep ?? 'Running...'}</span>
    : <span className="text-gray-400 text-sm">Idle</span>;

  const nextRunDisplay = status?.nextRun
    ? new Date(status.nextRun).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '09:00';

  return (
    <div className="space-y-4">
      {/* API key health */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3 flex-wrap">
        <span className="text-xs text-gray-500 mr-1">API Keys:</span>
        <ApiKeyBadge ok={status?.groqKeyOk ?? false} label="Groq" />
        <ApiKeyBadge ok={status?.geminiKeyOk ?? false} label="Gemini" />
        {(!status?.groqKeyOk || !status?.geminiKeyOk) && onSettingsClick && (
          <button
            onClick={onSettingsClick}
            className="text-xs text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors"
          >
            Configure keys
          </button>
        )}
        <span className="ml-auto text-xs text-gray-500">
          Next run: <span className="text-gray-300">{nextRunDisplay}</span>
        </span>
      </div>

      {/* Status cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          title="Today's Topic"
          value={today?.topic ?? <span className="text-gray-500 text-sm">Not generated</span>}
        />
        <Card
          title="Status"
          value={statusChip}
          sub={today?.lastUpdated ? `Updated ${new Date(today.lastUpdated).toLocaleTimeString()}` : undefined}
        />
        <Card
          title="Pipeline"
          value={stepDisplay}
          sub={status?.lastRun ? `Last: ${new Date(status.lastRun).toLocaleString()}` : 'Never run'}
        />
        <Card
          title="Total Rows"
          value={status?.rowCount ?? 0}
          sub={status?.lastModified ? `File: ${new Date(status.lastModified).toLocaleDateString()}` : undefined}
        />
      </div>

      {status?.lastError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm">
          <span className="font-medium">Last error: </span>{status.lastError}
        </div>
      )}
    </div>
  );
}
