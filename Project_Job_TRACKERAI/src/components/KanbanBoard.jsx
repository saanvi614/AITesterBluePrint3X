import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';
import JobCard from './JobCard';
import { COLUMNS, COLUMN_IDS } from '../constants';

export default function KanbanBoard({
  jobs,
  allJobs,
  sortOrder,
  onAddJob,
  onEditJob,
  onDeleteJob,
  onMoveJob,
  onReorderJobs,
}) {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const jobsByStatus = useMemo(() => {
    const map = {};
    for (const col of COLUMNS) {
      const colJobs = jobs.filter((j) => j.status === col.id);
      if (sortOrder === 'oldest') {
        colJobs.sort(
          (a, b) =>
            new Date(a.dateApplied || a.createdAt) -
            new Date(b.dateApplied || b.createdAt)
        );
      } else if (sortOrder === 'newest') {
        colJobs.sort(
          (a, b) =>
            new Date(b.dateApplied || b.createdAt) -
            new Date(a.dateApplied || a.createdAt)
        );
      } else {
        colJobs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      }
      map[col.id] = colJobs;
    }
    return map;
  }, [jobs, sortOrder]);

  const activeJob = activeId ? allJobs.find((j) => j.id === activeId) : null;
  const activeColumn = activeJob
    ? COLUMNS.find((c) => c.id === activeJob.status)
    : null;

  const onDragStart = ({ active }) => setActiveId(active.id);

  const onDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const activeJobItem = allJobs.find((j) => j.id === active.id);
    if (!activeJobItem) return;

    const overId = over.id;

    // Dropped directly on a column (empty column area)
    if (COLUMN_IDS.includes(overId)) {
      if (activeJobItem.status !== overId) {
        onMoveJob(active.id, overId);
      }
      return;
    }

    // Dropped on a card
    const overType = over.data.current?.type;
    if (overType !== 'card') return;

    const overColumnId = over.data.current?.columnId;
    const activeColumnId = activeJobItem.status;

    if (activeColumnId === overColumnId) {
      // Same column: reorder (only in manual sort mode)
      if (sortOrder !== 'manual') return;
      const colJobs = jobsByStatus[activeColumnId] || [];
      const oldIndex = colJobs.findIndex((j) => j.id === active.id);
      const newIndex = colJobs.findIndex((j) => j.id === overId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reordered = arrayMove(colJobs, oldIndex, newIndex);
        const updatedAll = allJobs.map((j) => {
          const idx = reordered.findIndex((r) => r.id === j.id);
          if (idx !== -1) return { ...j, order: idx, updatedAt: new Date().toISOString() };
          return j;
        });
        onReorderJobs(updatedAll);
      }
    } else {
      // Different column: move to over card's column
      onMoveJob(active.id, overColumnId);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div
        className="flex gap-3 px-4 py-4 overflow-x-auto h-full"
        style={{ alignItems: 'flex-start' }}
      >
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            jobs={jobsByStatus[column.id] || []}
            isDragging={!!activeId}
            onAddJob={onAddJob}
            onEditJob={onEditJob}
            onDeleteJob={onDeleteJob}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
        {activeJob && activeColumn ? (
          <JobCard job={activeJob} column={activeColumn} isOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
