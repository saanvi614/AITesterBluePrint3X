'use client';

import { ContentRow } from '@/lib/types';

interface Props {
  rows: ContentRow[];
  lastModified: string | null;
  rowCount: number;
}

const AGENT_COLORS: Record<string, string> = {
  Agent1: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  Agent2: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  Agent3: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
};

function agentLabel(by: string): string {
  const map: Record<string, string> = {
    Agent1: 'Topic Gen',
    Agent2: 'Writer',
    Agent3: 'Imager',
  };
  return map[by] ?? by;
}

function downloadXlsx() {
  window.location.href = '/api/download';
}

export function ExcelLog({ rows, lastModified, rowCount }: Props) {
  const sorted = [...rows].sort((a, b) => {
    const tA = a.lastUpdated ?? '';
    const tB = b.lastUpdated ?? '';
    return tB.localeCompare(tA);
  });

  return (
    <div className="space-y-4">
      {/* File info bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-400">
            <span className="text-white font-medium">{rowCount}</span> rows in content_calendar.xlsx
          </span>
          {lastModified && (
            <span className="text-gray-500">
              File modified: <span className="text-gray-300">{new Date(lastModified).toLocaleString()}</span>
            </span>
          )}
        </div>
        <button
          onClick={downloadXlsx}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download .xlsx
        </button>
      </div>

      {/* Write log */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm font-medium text-gray-200">Write Activity Log</h3>
          <p className="text-xs text-gray-500 mt-0.5">Rows sorted by last write time, newest first</p>
        </div>
        <div className="divide-y divide-gray-800 max-h-[60vh] overflow-y-auto scrollbar-thin">
          {sorted.length === 0 ? (
            <p className="p-6 text-center text-gray-500 text-sm">No rows yet.</p>
          ) : (
            sorted.map((row) => (
              <div key={row.date} className="px-4 py-3 flex items-start gap-4">
                <span className="font-mono text-xs text-gray-500 mt-0.5 shrink-0">{row.date}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200 truncate">{row.topic}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                      AGENT_COLORS[row.updatedBy ?? ''] ?? 'bg-gray-700 text-gray-400 border-gray-600'
                    }`}>
                      {agentLabel(row.updatedBy ?? '')} wrote
                    </span>
                    <span className="text-xs text-gray-600">→</span>
                    <span className="text-xs text-gray-400 capitalize">
                      {[
                        row.linkedinPost     ? 'LinkedIn'   : null,
                        row.mediumArticle    ? 'Medium'     : null,
                        row.igScript         ? 'Instagram'  : null,
                        row.ytScript         ? 'YouTube'    : null,
                        row.devtoArticle     ? 'Dev.to'     : null,
                        row.linkedinImage    ? 'LI Image'   : null,
                        row.mediumImage      ? 'MD Image'   : null,
                        row.igImage          ? 'IG Image'   : null,
                      ].filter(Boolean).join(', ') || 'row created'}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-600 shrink-0">
                  {row.lastUpdated ? new Date(row.lastUpdated).toLocaleTimeString() : '—'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
