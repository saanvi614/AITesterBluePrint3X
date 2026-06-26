'use client';

import { ContentRow } from '@/lib/types';

interface Props {
  rows: ContentRow[];
}

const STATUS_STYLES: Record<string, string> = {
  Pending:  'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  Writing:  'bg-blue-500/15 text-blue-300 border-blue-500/30',
  Imaging:  'bg-purple-500/15 text-purple-300 border-purple-500/30',
  Done:     'bg-green-500/15 text-green-300 border-green-500/30',
  Error:    'bg-red-500/15 text-red-300 border-red-500/30',
};

function hasContent(row: ContentRow): boolean {
  return !!(row.linkedinPost || row.mediumArticle || row.igScript || row.ytScript || row.devtoArticle);
}

function hasImages(row: ContentRow): boolean {
  return !!(row.linkedinImage || row.mediumImage || row.igImage);
}

export function CalendarTable({ rows }: Props) {
  if (!rows.length) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-500">
        No content generated yet. Run the pipeline to get started.
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="px-4 py-3 text-xs uppercase tracking-wider text-gray-500">Date</th>
              <th className="px-4 py-3 text-xs uppercase tracking-wider text-gray-500">Topic</th>
              <th className="px-4 py-3 text-xs uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-4 py-3 text-xs uppercase tracking-wider text-gray-500">Content</th>
              <th className="px-4 py-3 text-xs uppercase tracking-wider text-gray-500">Images</th>
              <th className="px-4 py-3 text-xs uppercase tracking-wider text-gray-500">Last Updated</th>
              <th className="px-4 py-3 text-xs uppercase tracking-wider text-gray-500">By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {rows.map((row) => (
              <tr key={row.date} className="hover:bg-gray-800/40 transition-colors">
                <td className="px-4 py-3 font-mono text-gray-300">{row.date}</td>
                <td className="px-4 py-3 text-gray-200 max-w-xs">
                  <span className="line-clamp-2">{row.topic}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[row.status] ?? ''}`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {hasContent(row) ? (
                    <span className="text-green-400 text-xs">5 pieces</span>
                  ) : (
                    <span className="text-gray-600 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {hasImages(row) ? (
                    <span className="text-green-400 text-xs">3 images</span>
                  ) : (
                    <span className="text-gray-600 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {row.lastUpdated ? new Date(row.lastUpdated).toLocaleString() : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-gray-500 font-mono">{row.updatedBy || '—'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
