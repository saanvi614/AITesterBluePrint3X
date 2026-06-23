import { useState, useEffect } from 'react';
import Header from './components/Header';
import KanbanBoard from './components/KanbanBoard';
import JobModal from './components/JobModal';
import ConfirmDialog from './components/ConfirmDialog';
import { db } from './lib/db';
import { generateId, todayISO } from './utils/helpers';

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('manual');
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem('theme') === 'dark'
  );
  const [modal, setModal] = useState({ open: false, job: null, defaultStatus: null });
  const [confirm, setConfirm] = useState({ open: false, jobId: null });

  useEffect(() => {
    db.getAll().then(setJobs);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const openAdd = (defaultStatus = 'wishlist') =>
    setModal({ open: true, job: null, defaultStatus });

  const openEdit = (job) =>
    setModal({ open: true, job, defaultStatus: null });

  const closeModal = () =>
    setModal({ open: false, job: null, defaultStatus: null });

  const handleSave = async (formData) => {
    if (formData.id) {
      const updated = { ...formData, updatedAt: new Date().toISOString() };
      await db.put(updated);
      setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
    } else {
      const newJob = {
        ...formData,
        id: generateId(),
        order: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dateApplied: formData.dateApplied || todayISO(),
      };
      await db.put(newJob);
      setJobs((prev) => [...prev, newJob]);
    }
    closeModal();
  };

  const requestDelete = (jobId) => setConfirm({ open: true, jobId });

  const confirmDelete = async () => {
    await db.delete(confirm.jobId);
    setJobs((prev) => prev.filter((j) => j.id !== confirm.jobId));
    setConfirm({ open: false, jobId: null });
  };

  const moveJob = async (jobId, newStatus) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job || job.status === newStatus) return;
    const updated = {
      ...job,
      status: newStatus,
      order: Date.now(),
      updatedAt: new Date().toISOString(),
    };
    await db.put(updated);
    setJobs((prev) => prev.map((j) => (j.id === jobId ? updated : j)));
  };

  const reorderJobs = async (updatedJobs) => {
    setJobs(updatedJobs);
    await Promise.all(updatedJobs.map((j) => db.put(j)));
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(jobs, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-tracker-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (jsonText) => {
    try {
      const imported = JSON.parse(jsonText);
      if (!Array.isArray(imported)) throw new Error('Expected array');
      await Promise.all(imported.map((j) => db.put(j)));
      const all = await db.getAll();
      setJobs(all);
    } catch {
      alert('Invalid backup file. Expected a JSON array of job records.');
    }
  };

  const existingResumes = [
    ...new Set(jobs.map((j) => j.resumeUsed).filter(Boolean)),
  ];

  const filteredJobs = searchQuery.trim()
    ? jobs.filter(
        (j) =>
          j.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.role?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : jobs;

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isDark={isDark}
        onToggleTheme={() => setIsDark((d) => !d)}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        onExport={handleExport}
        onImport={handleImport}
        onAddJob={() => openAdd('wishlist')}
      />

      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          jobs={filteredJobs}
          allJobs={jobs}
          sortOrder={sortOrder}
          onAddJob={openAdd}
          onEditJob={openEdit}
          onDeleteJob={requestDelete}
          onMoveJob={moveJob}
          onReorderJobs={reorderJobs}
        />
      </div>

      <footer className="shrink-0 h-9 flex items-center justify-center border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          Crafted by{' '}
          <span className="font-semibold text-gray-600 dark:text-gray-300">@swati Jadhav</span>
        </span>
      </footer>

      {modal.open && (
        <JobModal
          job={modal.job}
          defaultStatus={modal.defaultStatus}
          existingResumes={existingResumes}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}

      {confirm.open && (
        <ConfirmDialog
          onConfirm={confirmDelete}
          onCancel={() => setConfirm({ open: false, jobId: null })}
        />
      )}
    </div>
  );
}
