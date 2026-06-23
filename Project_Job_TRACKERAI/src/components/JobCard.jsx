import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { daysSince } from '../utils/helpers';

function LinkedInIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function CardContent({ job, column, onEdit, onDelete, isOverlay }) {
  const sinceText = daysSince(job.dateApplied);

  return (
    <div
      className={`relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 border-l-4 ${
        column?.border ?? 'border-l-gray-300'
      } p-3 select-none group ${
        isOverlay
          ? 'shadow-2xl ring-2 ring-blue-400 dark:ring-blue-500 rotate-1 scale-105'
          : 'shadow-sm hover:shadow-md'
      } transition-shadow`}
    >
      {/* Header row */}
      <div className="flex items-start gap-1">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate leading-tight">
            {job.company}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
            {job.role}
          </p>
        </div>

        {!isOverlay && (
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(job);
              }}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
              title="Edit"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(job.id);
              }}
              className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition"
              title="Delete"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Tags row */}
      {(job.resumeUsed || sinceText || job.salaryRange) && (
        <div className="flex flex-wrap gap-1 mt-2">
          {job.resumeUsed && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-gray-100 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-full font-medium max-w-full">
              <svg className="w-3 h-3 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="truncate max-w-[110px]">{job.resumeUsed}</span>
            </span>
          )}
          {sinceText && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-gray-100 dark:bg-gray-700/80 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-full">
              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {sinceText}
            </span>
          )}
          {job.salaryRange && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-gray-100 dark:bg-gray-700/80 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-full">
              <span className="text-gray-400">₹/$</span>
              <span className="truncate max-w-[80px]">{job.salaryRange}</span>
            </span>
          )}
        </div>
      )}

      {/* Notes snippet */}
      {job.notes && (
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5 line-clamp-2 leading-snug">
          {job.notes}
        </p>
      )}

      {/* LinkedIn link */}
      {job.linkedinUrl && (
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <a
            href={job.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-[11px] text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition font-medium"
          >
            <LinkedInIcon className="w-3 h-3 shrink-0" />
            View on LinkedIn
          </a>
        </div>
      )}
    </div>
  );
}

export default function JobCard({ job, column, onEdit, onDelete, isOverlay }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: job.id,
    data: { type: 'card', columnId: job.status },
    disabled: !!isOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 9 : undefined,
  };

  if (isOverlay) {
    return (
      <div className="mb-2">
        <CardContent job={job} column={column} isOverlay />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="mb-2 cursor-grab active:cursor-grabbing touch-none"
    >
      <CardContent
        job={job}
        column={column}
        onEdit={onEdit}
        onDelete={onDelete}
        isOverlay={false}
      />
    </div>
  );
}
