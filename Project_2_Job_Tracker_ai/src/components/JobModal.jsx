import { useState, useEffect, useRef } from 'react';
import { COLUMNS } from '../constants';

const LOCATIONS = ['remote', 'on-site', 'hybrid'];
const PRIORITIES = ['high', 'medium', 'low'];

const empty = {
  company: '', role: '', linkedinUrl: '', resume: '', dateApplied: '',
  salaryRange: '', notes: '', status: 'wishlist', priority: 'medium',
  location: 'remote', followUpDate: '', archived: false,
};

const inputCls = (err) =>
  `w-full bg-[#141414] border ${err ? 'border-red-500/50' : 'border-[#252525]'} text-white placeholder-[#444] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#3b82f6]/50 transition-colors`;

const selCls = 'w-full bg-[#141414] border border-[#252525] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#3b82f6]/50 transition-colors';

const Field = ({ label, children, error }) => (
  <div>
    <label className="block text-xs text-[#888] mb-1">{label}</label>
    {children}
    {error && <p className="text-red-400 text-[10px] mt-0.5">{error}</p>}
  </div>
);

export default function JobModal({ job, initialStatus, onSave, onClose, uniqueResumes }) {
  const [form, setForm] = useState(() => ({
    ...empty,
    status: initialStatus || 'wishlist',
    dateApplied: new Date().toISOString().slice(0, 10),
    ...(job || {}),
  }));
  const [errors, setErrors] = useState({});
  const [showResumeList, setShowResumeList] = useState(false);
  const companyRef = useRef(null);
  const didFocus = useRef(false); // refs survive StrictMode remount; state does not

  useEffect(() => {
    if (!didFocus.current) {
      didFocus.current = true;
      companyRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.company.trim()) e.company = 'Company name is required';
    if (!form.role.trim()) e.role = 'Job role is required';
    return e;
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave(form);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#111] border border-[#222] rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1e1e]">
          <h2 className="text-white font-semibold text-sm">
            {job ? 'Edit Job' : 'Add New Job'}
          </h2>
          <button onClick={onClose} className="text-[#555] hover:text-white transition-colors text-lg leading-none">×</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-5 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Company *" error={errors.company}>
              <input
                ref={companyRef}
                className={inputCls(errors.company)}
                placeholder="e.g. Google"
                value={form.company}
                onChange={e => set('company', e.target.value)}
              />
            </Field>
            <Field label="Role *" error={errors.role}>
              <input
                className={inputCls(errors.role)}
                placeholder="e.g. SDE-2"
                value={form.role}
                onChange={e => set('role', e.target.value)}
              />
            </Field>
          </div>

          <Field label="LinkedIn URL">
            <input
              className={inputCls()}
              placeholder="https://linkedin.com/jobs/..."
              value={form.linkedinUrl}
              onChange={e => set('linkedinUrl', e.target.value)}
              type="url"
            />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Status">
              <select className={selCls} value={form.status} onChange={e => set('status', e.target.value)}>
                {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Priority">
              <select className={selCls} value={form.priority} onChange={e => set('priority', e.target.value)}>
                {PRIORITIES.map(p => <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </Field>
            <Field label="Location">
              <select className={selCls} value={form.location} onChange={e => set('location', e.target.value)}>
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Date Applied">
              <input
                className={inputCls()}
                type="date"
                value={form.dateApplied}
                onChange={e => set('dateApplied', e.target.value)}
              />
            </Field>
            <Field label="Follow-up Date">
              <input
                className={inputCls()}
                type="date"
                value={form.followUpDate}
                onChange={e => set('followUpDate', e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Resume with suggestions */}
            <Field label="Resume Used">
              <div className="relative">
                <input
                  className={inputCls()}
                  placeholder="e.g. SDE_Resume_v3"
                  value={form.resume}
                  onChange={e => { set('resume', e.target.value); setShowResumeList(true); }}
                  onFocus={() => setShowResumeList(true)}
                  onBlur={() => setTimeout(() => setShowResumeList(false), 150)}
                />
                {showResumeList && uniqueResumes.filter(r => r.toLowerCase().includes(form.resume.toLowerCase()) && r !== form.resume).length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-[#252525] rounded-lg overflow-hidden z-10">
                    {uniqueResumes
                      .filter(r => r.toLowerCase().includes(form.resume.toLowerCase()) && r !== form.resume)
                      .map(r => (
                        <button
                          key={r}
                          type="button"
                          onMouseDown={() => { set('resume', r); setShowResumeList(false); }}
                          className="w-full text-left px-3 py-1.5 text-xs text-[#aaa] hover:bg-[#252525] hover:text-white transition-colors"
                        >
                          {r}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </Field>
            <Field label="Salary Range">
              <input
                className={inputCls()}
                placeholder="e.g. $150-180K"
                value={form.salaryRange}
                onChange={e => set('salaryRange', e.target.value)}
              />
            </Field>
          </div>

          <Field label="Notes">
            <textarea
              className={`${inputCls()} resize-none h-20`}
              placeholder="Recruiter name, referral, notes..."
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
            />
          </Field>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#1e1e1e]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-sm rounded-lg border border-[#252525] text-[#666] hover:text-white hover:border-[#444] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-1.5 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
          >
            {job ? 'Save Changes' : 'Add Job'}
          </button>
        </div>
      </div>
    </div>
  );
}
