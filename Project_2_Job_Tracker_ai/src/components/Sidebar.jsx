import { COLUMNS } from '../constants';

const NAV = [
  { id: 'board',     icon: '⊞', label: 'Board'     },
  { id: 'dashboard', icon: '◈', label: 'Dashboard' },
  { id: 'archive',   icon: '↓', label: 'Archive'   },
];

const SHORTCUTS = [
  { key: 'n',      label: 'Add job'   },
  { key: '/',      label: 'Search'    },
  { key: 'd',      label: 'Dashboard' },
  { key: 't',      label: 'Theme'     },
  { key: 'Ctrl+Z', label: 'Undo'      },
  { key: 'Esc',    label: 'Close'     },
];

export default function Sidebar({ jobs, activeView, onViewChange, onAddJob }) {
  const countByStatus = (statusId) => jobs.filter(j => !j.archived && j.status === statusId).length;

  return (
    <aside className="w-52 shrink-0 flex flex-col border-r border-[#1e1e1e] bg-[#0b0b0b] min-h-screen select-none">
      {/* Brand */}
      <div className="px-4 py-4 border-b border-[#1e1e1e]">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🤖</span>
          <span className="font-semibold text-white tracking-tight text-sm">JobTrack AI</span>
        </div>
      </div>

      {/* Views */}
      <div className="px-3 pt-4 pb-2">
        <p className="text-[#444] text-[10px] font-semibold uppercase tracking-widest px-2 mb-1.5">Views</p>
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm mb-0.5 transition-colors
              ${activeView === item.id
                ? 'bg-[#1e1e1e] text-white'
                : 'text-[#666] hover:text-[#aaa] hover:bg-[#151515]'
              }`}
          >
            <span className="text-xs w-4 text-center">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* Pipeline */}
      <div className="px-3 pt-3 pb-2">
        <p className="text-[#444] text-[10px] font-semibold uppercase tracking-widest px-2 mb-1.5">Pipeline</p>
        {COLUMNS.map(col => (
          <button
            key={col.id}
            onClick={() => onViewChange('board')}
            className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm mb-0.5 text-[#666] hover:text-[#aaa] hover:bg-[#151515] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
              <span>{col.label}</span>
            </div>
            <span className="text-[#444] text-xs">{countByStatus(col.id)}</span>
          </button>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Shortcuts */}
      <div className="px-3 pb-4">
        <p className="text-[#444] text-[10px] font-semibold uppercase tracking-widest px-2 mb-2">Shortcuts</p>
        {SHORTCUTS.map(s => (
          <div key={s.key} className="flex items-center justify-between px-2 py-0.5">
            <kbd className="text-[10px] text-[#444] bg-[#1a1a1a] border border-[#2a2a2a] px-1.5 py-0.5 rounded font-mono">{s.key}</kbd>
            <span className="text-[10px] text-[#444]">{s.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
