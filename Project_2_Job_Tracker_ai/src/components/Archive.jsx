import { COLUMNS } from '../constants';

export default function Archive({ jobs, onRestore, onDelete }) {
  if (jobs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-[#333] text-sm">
        No archived jobs.
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold">Archive</h2>
        <span className="text-[#555] text-xs">{jobs.length} job{jobs.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="space-y-2">
        {jobs.map(job => {
          const col = COLUMNS.find(c => c.id === job.status);
          return (
            <div key={job.id} className="flex items-center justify-between bg-[#141414] border border-[#222] rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                {col && <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: col.color }} />}
                <div>
                  <p className="text-white text-sm font-medium">{job.company}</p>
                  <p className="text-[#555] text-xs">{job.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {col && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ color: col.color, backgroundColor: `${col.color}15` }}>
                    {col.label}
                  </span>
                )}
                <button
                  onClick={() => onRestore(job)}
                  className="text-xs px-2.5 py-1 rounded-lg border border-[#2a2a2a] text-[#666] hover:text-white hover:border-[#444] transition-colors"
                >
                  Restore
                </button>
                <button
                  onClick={() => onDelete(job.id)}
                  className="text-xs px-2.5 py-1 rounded-lg border border-[#2a2a2a] text-[#666] hover:text-red-400 hover:border-red-500/40 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
