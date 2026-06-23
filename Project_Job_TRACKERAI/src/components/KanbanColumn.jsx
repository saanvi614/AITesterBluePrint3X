import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import JobCard from './JobCard';

export default function KanbanColumn({
  column,
  jobs,
  isDragging,
  onAddJob,
  onEditJob,
  onDeleteJob,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: 'column', columnId: column.id },
  });

  return (
    <div className="flex flex-col min-w-[272px] w-[272px] rounded-xl bg-white dark:bg-gray-800/70 shadow-md border border-gray-200 dark:border-gray-700 shrink-0 max-h-full overflow-hidden">
      {/* Colored accent bar at top */}
      <div className={`h-1.5 w-full ${column.accent} shrink-0`} />

      {/* Column Header */}
      <div className="flex items-center justify-between px-3 py-2.5 shrink-0 border-b border-gray-100 dark:border-gray-700/60">
        <div className="flex items-center gap-2">
          <span className={`font-semibold text-sm tracking-wide uppercase ${column.headerText}`}>
            {column.label}
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${column.badge}`}>
            {jobs.length}
          </span>
        </div>
        <button
          onClick={() => onAddJob(column.id)}
          title={`Add job to ${column.label}`}
          className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-base leading-none font-medium"
        >
          +
        </button>
      </div>

      {/* Cards container */}
      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto px-2 pt-2 pb-2 transition-colors min-h-[80px] ${
          isOver
            ? 'bg-gray-100 dark:bg-gray-700/40'
            : isDragging
            ? 'bg-gray-50 dark:bg-gray-800/30'
            : ''
        }`}
      >
        <SortableContext
          items={jobs.map((j) => j.id)}
          strategy={verticalListSortingStrategy}
        >
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              column={column}
              onEdit={onEditJob}
              onDelete={onDeleteJob}
            />
          ))}
        </SortableContext>

        {jobs.length === 0 && (
          <div
            className={`flex flex-col items-center justify-center h-20 rounded-lg border-2 border-dashed transition-colors gap-1 ${
              isOver
                ? 'border-gray-400 dark:border-gray-500 text-gray-500 dark:text-gray-400'
                : 'border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600'
            } text-xs`}
          >
            {isOver ? (
              <span className="font-medium">Drop here</span>
            ) : (
              <>
                <svg className="w-4 h-4 opacity-40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
                <span>No jobs yet</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
