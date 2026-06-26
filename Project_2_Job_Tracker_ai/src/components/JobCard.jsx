import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { PRIORITY_STYLES, LOCATION_STYLES } from '../constants';

function daysSince(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / 86400000);
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.floor(diff / 86400000);
}

export default function JobCard({ job, colColor, onEdit, onDelete, onArchive, isOverlay }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: job.id,
    disabled: isOverlay,
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform), zIndex: 999 }
    : undefined;

  const days = daysSince(job.dateApplied);
  const followDays = daysUntil(job.followUpDate);
  const isOverdue = job.followUpDate && followDays !== null && followDays < 0;
  const followSoon = job.followUpDate && followDays !== null && followDays >= 0 && followDays <= 2;

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      className={`group relative rounded-xl border bg-[#1a1a1a] border-[#252525] hover:border-[#333] transition-all cursor-grab active:cursor-grabbing
        ${isDragging && !isOverlay ? 'card-dragging' : ''}
        ${isOverlay ? 'shadow-2xl shadow-black/50 rotate-1 cursor-grabbing' : ''}
      `}
      {...(isOverlay ? {} : { ...attributes, ...listeners })}
    >
      {/* Left accent border */}
      <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full" style={{ backgroundColor: colColor }} />

      <div className="pl-4 pr-3 pt-3 pb-3">
        {/* Company + LinkedIn */}
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <div>
            <h3 className="text-white font-semibold text-sm leading-tight">{job.company}</h3>
            <p className="text-[#888] text-xs mt-0.5">{job.role}</p>
          </div>
          {job.linkedinUrl && (
            <a
              href={job.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              onClick={e => e.stopPropagation()}
              onPointerDown={e => e.stopPropagation()}
              className="text-[#444] hover:text-blue-400 transition-colors mt-0.5 shrink-0"
              title="Open LinkedIn"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
            </a>
          )}
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap gap-1 mt-2">
          {job.priority && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium capitalize ${PRIORITY_STYLES[job.priority] || ''}`}>
              {job.priority}
            </span>
          )}
          {job.location && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md capitalize ${LOCATION_STYLES[job.location] || ''}`}>
              {job.location}
            </span>
          )}
          {job.resume && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#252525] text-[#888] border border-[#333] flex items-center gap-1">
              <span>📄</span>{job.resume}
            </span>
          )}
        </div>

        {/* Salary */}
        {job.salaryRange && (
          <p className="text-[#666] text-xs mt-2">{job.salaryRange}</p>
        )}

        {/* Follow-up / Overdue */}
        {job.followUpDate && (
          <div className={`flex items-center gap-1 mt-1.5 text-[10px] font-medium
            ${isOverdue ? 'text-red-400' : followSoon ? 'text-amber-400' : 'text-[#666]'}`}
          >
            {isOverdue && <span>🔔</span>}
            {isOverdue
              ? `Overdue ${Math.abs(followDays)}d`
              : followSoon
              ? `Follow up in ${followDays}d`
              : `Follow up ${new Date(job.followUpDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
          </div>
        )}

        {/* Applied date */}
        {job.dateApplied && (
          <p className="text-[#444] text-[10px] mt-1">
            Applied {new Date(job.dateApplied).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {days !== null && ` · ${days}d ago`}
          </p>
        )}

        {/* Actions */}
        <div
          className="flex gap-1.5 mt-2.5"
          onPointerDown={e => e.stopPropagation()}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(job)}
            className="text-[10px] px-2 py-0.5 rounded border border-[#2a2a2a] text-[#666] hover:text-white hover:border-[#444] transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onArchive(job)}
            className="text-[10px] px-2 py-0.5 rounded border border-[#2a2a2a] text-[#666] hover:text-amber-400 hover:border-amber-500/40 transition-colors"
          >
            Archive
          </button>
          <button
            onClick={() => onDelete(job.id)}
            className="text-[10px] px-2 py-0.5 rounded border border-[#2a2a2a] text-[#666] hover:text-red-400 hover:border-red-500/40 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
