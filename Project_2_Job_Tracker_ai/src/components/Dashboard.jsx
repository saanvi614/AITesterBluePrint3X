import { useMemo } from 'react';
import { COLUMNS } from '../constants';

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-[#141414] border border-[#222] rounded-xl p-4">
      <p className="text-[#555] text-xs mb-1">{label}</p>
      <p className="text-white text-2xl font-bold" style={color ? { color } : {}}>
        {value}
      </p>
      {sub && <p className="text-[#444] text-xs mt-1">{sub}</p>}
    </div>
  );
}

export default function Dashboard({ jobs }) {
  const stats = useMemo(() => {
    const active = jobs.filter(j => !j.archived);
    const now = new Date();
    const thisMonth = active.filter(j => {
      if (!j.dateApplied) return false;
      const d = new Date(j.dateApplied);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const responded = active.filter(j => ['interview', 'offer', 'rejected'].includes(j.status));
    const responseRate = active.length ? Math.round((responded.length / active.length) * 100) : 0;
    const interviews = active.filter(j => j.status === 'interview' || j.status === 'offer');
    const interviewRate = active.length ? Math.round((interviews.length / active.length) * 100) : 0;
    return { total: active.length, thisMonth: thisMonth.length, responseRate, interviewRate };
  }, [jobs]);

  const byCols = COLUMNS.map(col => ({
    ...col,
    count: jobs.filter(j => !j.archived && j.status === col.id).length,
  }));

  const maxCount = Math.max(...byCols.map(c => c.count), 1);

  const recent = [...jobs]
    .filter(j => !j.archived && j.dateApplied)
    .sort((a, b) => new Date(b.dateApplied) - new Date(a.dateApplied))
    .slice(0, 8);

  return (
    <div className="p-6 space-y-6 overflow-y-auto">
      <h2 className="text-white font-semibold">Overview</h2>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Jobs" value={stats.total} sub="tracked" />
        <StatCard label="This Month" value={stats.thisMonth} sub="applications" color="#3b82f6" />
        <StatCard label="Response Rate" value={`${stats.responseRate}%`} sub="heard back" color="#a855f7" />
        <StatCard label="Interview Rate" value={`${stats.interviewRate}%`} sub="reached interview" color="#22c55e" />
      </div>

      {/* Pipeline bar */}
      <div className="bg-[#141414] border border-[#222] rounded-xl p-4">
        <p className="text-[#555] text-xs mb-4">Pipeline Distribution</p>
        <div className="space-y-2.5">
          {byCols.map(col => (
            <div key={col.id} className="flex items-center gap-3">
              <div className="w-20 text-xs text-[#666] text-right shrink-0">{col.label}</div>
              <div className="flex-1 bg-[#1a1a1a] rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${maxCount > 0 ? (col.count / maxCount) * 100 : 0}%`,
                    backgroundColor: col.color,
                    minWidth: col.count > 0 ? '6px' : '0px',
                  }}
                />
              </div>
              <span className="text-xs text-[#555] w-6 text-right">{col.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-[#141414] border border-[#222] rounded-xl p-4">
        <p className="text-[#555] text-xs mb-3">Recent Applications</p>
        {recent.length === 0 ? (
          <p className="text-[#333] text-xs">No applications yet.</p>
        ) : (
          <div className="divide-y divide-[#1e1e1e]">
            {recent.map(job => {
              const col = COLUMNS.find(c => c.id === job.status);
              return (
                <div key={job.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-white text-xs font-medium">{job.company}</p>
                    <p className="text-[#555] text-[10px]">{job.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {col && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ color: col.color, backgroundColor: `${col.color}20` }}>
                        {col.label}
                      </span>
                    )}
                    <span className="text-[#444] text-[10px]">
                      {job.dateApplied ? new Date(job.dateApplied).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
