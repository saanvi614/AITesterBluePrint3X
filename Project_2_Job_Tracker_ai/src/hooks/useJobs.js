import { useState, useEffect, useCallback } from 'react';
import { getAllJobs, saveJob, removeJob, clearAllJobs } from '../db';

export function useJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllJobs().then(all => {
      setJobs(all);
      setLoading(false);
    });
  }, []);

  const createJob = useCallback(async (data) => {
    const job = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveJob(job);
    setJobs(prev => [...prev, job]);
    return job;
  }, []);

  const updateJob = useCallback(async (updated) => {
    const job = { ...updated, updatedAt: new Date().toISOString() };
    await saveJob(job);
    setJobs(prev => prev.map(j => j.id === job.id ? job : j));
  }, []);

  const deleteJob = useCallback(async (id) => {
    await removeJob(id);
    setJobs(prev => prev.filter(j => j.id !== id));
  }, []);

  const moveJob = useCallback(async (id, newStatus) => {
    setJobs(prev => {
      const job = prev.find(j => j.id === id);
      if (!job || job.status === newStatus) return prev;
      const updated = { ...job, status: newStatus, updatedAt: new Date().toISOString() };
      saveJob(updated);
      return prev.map(j => j.id === id ? updated : j);
    });
  }, []);

  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(jobs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-tracker-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [jobs]);

  const importData = useCallback(async (file) => {
    const text = await file.text();
    const imported = JSON.parse(text);
    await clearAllJobs();
    for (const job of imported) await saveJob(job);
    setJobs(imported);
  }, []);

  return { jobs, loading, createJob, updateJob, deleteJob, moveJob, exportData, importData };
}
