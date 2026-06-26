import { useState, useEffect, useMemo, useRef } from 'react';
import { useJobs } from './hooks/useJobs';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Board from './components/Board';
import Dashboard from './components/Dashboard';
import Archive from './components/Archive';
import JobModal from './components/JobModal';
import ConfirmDialog from './components/ConfirmDialog';
import Footer from './components/Footer';

export default function App() {
  const { jobs, loading, createJob, updateJob, deleteJob, moveJob, exportData, importData } = useJobs();

  const [searchQuery, setSearchQuery]         = useState('');
  const [filterPriority, setFilterPriority]   = useState('all');
  const [filterResume, setFilterResume]       = useState('all');
  const [sortOrder, setSortOrder]             = useState('newest');
  const [theme, setTheme]                     = useState(() => localStorage.getItem('jt-theme') || 'dark');
  const [activeView, setActiveView]           = useState('board');
  const [isModalOpen, setIsModalOpen]         = useState(false);
  const [editingJob, setEditingJob]           = useState(null);
  const [initialStatus, setInitialStatus]     = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Apply theme class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('jt-theme', theme);
  }, [theme]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      // Check focused element first — prevents stale-closure issues with isModalOpen
      const tag = (e.target || document.activeElement)?.tagName?.toUpperCase();
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      if (isModalOpen) return;
      if (e.key === 'n') { setEditingJob(null); setInitialStatus('wishlist'); setIsModalOpen(true); }
      if (e.key === '/') { e.preventDefault(); document.getElementById('search-input')?.focus(); }
      if (e.key === 'd') setActiveView('dashboard');
      if (e.key === 't') setTheme(t => t === 'dark' ? 'light' : 'dark');
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isModalOpen]);

  const uniqueResumes = useMemo(
    () => [...new Set(jobs.map(j => j.resume).filter(Boolean))],
    [jobs]
  );

  // Overdue follow-ups (jobs in applied/followup with past followUpDate)
  const overdueJobs = useMemo(() =>
    jobs.filter(j =>
      !j.archived &&
      j.followUpDate &&
      (j.status === 'applied' || j.status === 'followup') &&
      new Date(j.followUpDate) < new Date()
    ), [jobs]
  );

  const filteredJobs = useMemo(() => {
    let result = jobs.filter(j => !j.archived);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(j =>
        j.company.toLowerCase().includes(q) ||
        j.role.toLowerCase().includes(q)
      );
    }
    if (filterPriority !== 'all') result = result.filter(j => j.priority === filterPriority);
    if (filterResume !== 'all') result = result.filter(j => j.resume === filterResume);

    result = [...result].sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.dateApplied || b.createdAt) - new Date(a.dateApplied || a.createdAt);
      if (sortOrder === 'oldest') return new Date(a.dateApplied || a.createdAt) - new Date(b.dateApplied || b.createdAt);
      return a.company.localeCompare(b.company);
    });

    return result;
  }, [jobs, searchQuery, filterPriority, filterResume, sortOrder]);

  const openAddJob = (status = 'wishlist') => {
    setEditingJob(null);
    setInitialStatus(status);
    setIsModalOpen(true);
  };

  const openEditJob = (job) => {
    setEditingJob(job);
    setInitialStatus(job.status);
    setIsModalOpen(true);
  };

  const handleSave = async (formData) => {
    if (editingJob) {
      await updateJob({ ...editingJob, ...formData });
    } else {
      await createJob(formData);
    }
    setIsModalOpen(false);
    setEditingJob(null);
  };

  const handleArchive = async (job) => {
    await updateJob({ ...job, archived: true });
  };

  const handleRestore = async (job) => {
    await updateJob({ ...job, archived: false });
  };

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  if (loading) {
    return (
      <div className="h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-[#444] text-sm">Loading...</div>
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'bg-[#0d0d0d] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Sidebar
        jobs={jobs}
        activeView={activeView}
        onViewChange={setActiveView}
        onAddJob={() => openAddJob()}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <Header
          activeView={activeView}
          onViewChange={setActiveView}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          theme={theme}
          onThemeToggle={toggleTheme}
          onExport={exportData}
          onImport={importData}
          onAddJob={() => openAddJob()}
        />

        {/* Overdue banner */}
        {overdueJobs.length > 0 && (
          <div className="flex items-center gap-2 px-5 py-2 bg-red-500/10 border-b border-red-500/20">
            <span className="text-sm">🔔</span>
            <span className="text-red-400 text-xs font-medium">
              {overdueJobs.length} overdue follow-up{overdueJobs.length > 1 ? 's' : ''}:{' '}
              {overdueJobs.map(j => j.company).join(', ')}
            </span>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 overflow-hidden">
          {activeView === 'board' && (
            <Board
              jobs={filteredJobs}
              onEdit={openEditJob}
              onDelete={id => setDeleteConfirmId(id)}
              onArchive={handleArchive}
              onMove={moveJob}
              filterPriority={filterPriority}
              onFilterPriority={setFilterPriority}
              filterResume={filterResume}
              onFilterResume={setFilterResume}
              sortOrder={sortOrder}
              onSortOrder={setSortOrder}
              uniqueResumes={uniqueResumes}
              totalCount={filteredJobs.length}
              onAddCard={openAddJob}
            />
          )}
          {activeView === 'dashboard' && (
            <div className="h-full overflow-y-auto">
              <Dashboard jobs={jobs} />
            </div>
          )}
          {activeView === 'archive' && (
            <div className="h-full overflow-y-auto">
              <Archive
                jobs={jobs.filter(j => j.archived)}
                onRestore={handleRestore}
                onDelete={id => setDeleteConfirmId(id)}
              />
            </div>
          )}
        </div>

        <Footer />
      </div>

      {isModalOpen && (
        <JobModal
          job={editingJob}
          initialStatus={initialStatus}
          onSave={handleSave}
          onClose={() => { setIsModalOpen(false); setEditingJob(null); }}
          uniqueResumes={uniqueResumes}
        />
      )}

      {deleteConfirmId && (
        <ConfirmDialog
          message="Delete this job card permanently? This cannot be undone."
          onConfirm={() => { deleteJob(deleteConfirmId); setDeleteConfirmId(null); }}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}
    </div>
  );
}
