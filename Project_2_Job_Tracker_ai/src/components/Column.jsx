import { useDroppable } from '@dnd-kit/core';
import JobCard from './JobCard';

export default function Column({ col, jobs, onEdit, onDelete, onArchive, onAddCard }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });

  return (
    <div className="w-72 shrink-0 flex flex-col">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
          <span className="text-[#ccc] text-sm font-medium">{col.label}</span>
          <span className="text-[10px] text-[#555] bg-[#1a1a1a] border border-[#252525] px-1.5 py-0.5 rounded-full">
            {jobs.length}
          </span>
        </div>
        <button
          onClick={() => onAddCard(col.id)}
          className="w-6 h-6 flex items-center justify-center text-[#555] hover:text-white hover:bg-[#1e1e1e] rounded-md transition-colors text-base leading-none"
          title={`Add to ${col.label}`}
        >
          +
        </button>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-col gap-2 rounded-xl p-2 min-h-[120px] border transition-colors
          ${isOver
            ? 'border-[#3b82f6]/30 bg-[#3b82f6]/5'
            : 'border-transparent bg-[#0f0f0f]'
          }`}
      >
        {jobs.length === 0 && !isOver && (
          <div className="flex items-center justify-center h-16 text-[#333] text-xs border border-dashed border-[#222] rounded-lg">
            Drop here
          </div>
        )}
        {jobs.map(job => (
          <JobCard
            key={job.id}
            job={job}
            colColor={col.color}
            onEdit={onEdit}
            onDelete={onDelete}
            onArchive={onArchive}
          />
        ))}
      </div>
    </div>
  );
}
