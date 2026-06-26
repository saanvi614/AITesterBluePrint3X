import { useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { COLUMNS, SORT_OPTIONS } from '../constants';
import Column from './Column';
import JobCard from './JobCard';

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-[#141414] border border-[#222] text-[#aaa] text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#3b82f6]/40 transition-colors cursor-pointer"
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export default function Board({
  jobs, onEdit, onDelete, onArchive, onMove,
  filterPriority, onFilterPriority,
  filterResume, onFilterResume,
  sortOrder, onSortOrder,
  uniqueResumes, totalCount,
  onAddCard,
}) {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over) return;
    const columnIds = COLUMNS.map(c => c.id);
    if (columnIds.includes(over.id)) {
      onMove(active.id, over.id);
    }
  };

  const activeJob = activeId ? jobs.find(j => j.id === activeId) : null;
  const activeCol = activeJob ? COLUMNS.find(c => c.id === activeJob.status) : null;

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  const resumeOptions = [
    { value: 'all', label: 'All Resumes' },
    ...uniqueResumes.map(r => ({ value: r, label: r })),
  ];

  return (
    <DndContext
      sensors={sensors}
      onDragStart={({ active }) => setActiveId(active.id)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      {/* Filter bar */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-[#1a1a1a]">
        <Select value={filterPriority} onChange={onFilterPriority} options={priorityOptions} />
        <Select value={filterResume} onChange={onFilterResume} options={resumeOptions} />
        <Select value={sortOrder} onChange={onSortOrder} options={SORT_OPTIONS} />
        <div className="flex-1" />
        <span className="text-[#444] text-xs">{totalCount} job{totalCount !== 1 ? 's' : ''}</span>
      </div>

      {/* Columns */}
      <div className="flex gap-4 px-6 py-4 overflow-x-auto min-h-0 flex-1" style={{ height: 'calc(100vh - 160px)' }}>
        {COLUMNS.map(col => (
          <Column
            key={col.id}
            col={col}
            jobs={jobs.filter(j => j.status === col.id)}
            onEdit={onEdit}
            onDelete={onDelete}
            onArchive={onArchive}
            onAddCard={onAddCard}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeJob && activeCol ? (
          <JobCard
            job={activeJob}
            colColor={activeCol.color}
            onEdit={() => {}}
            onDelete={() => {}}
            onArchive={() => {}}
            isOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
