import { useState, useEffect, useRef } from 'react';
import { COLUMNS } from '../constants';
import { todayISO } from '../utils/helpers';

const BLANK = {
  company: '',
  role: '',
  status: 'wishlist',
  linkedinUrl: '',
  resumeUsed: '',
  dateApplied: '',
  salaryRange: '',
  notes: '',
};

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-red-500 text-[11px] mt-1">{error}</p>
      )}
    </div>
  );
}

const inputCls = (error) =>
  `w-full px-3 py-2 rounded-lg border text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
    error
      ? 'border-red-400 dark:border-red-500'
      : 'border-gray-200 dark:border-gray-700'
  }`;

export default function JobModal({
  job,
  defaultStatus,
  existingResumes,
  onSave,
  onClose,
}) {
  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (job) {
      setForm({ ...BLANK, ...job });
    } else {
      setForm({
        ...BLANK,
        status: defaultStatus || 'wishlist',
        dateApplied: todayISO(),
      });
    }
    setErrors({});
    setTimeout(() => firstInputRef.current?.focus(), 50);
  }, [job, defaultStatus]);

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.company.trim()) errs.company = 'Company name is required';
    if (!form.role.trim()) errs.role = 'Job title is required';
    if (form.linkedinUrl && !/^https?:\/\/.+/.test(form.linkedinUrl)) {
      errs.linkedinUrl = 'Must start with http:// or https://';
    }
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    onSave({ ...form, company: form.company.trim(), role: form.role.trim() });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {job ? 'Edit Job' : 'Add New Job'}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto max-h-[calc(90vh-130px)]"
        >
          <div className="px-5 py-4 space-y-4">
            {/* Company */}
            <Field label="Company" required error={errors.company}>
              <input
                ref={firstInputRef}
                type="text"
                value={form.company}
                onChange={set('company')}
                placeholder="e.g. Google, Infosys, Wipro"
                className={inputCls(errors.company)}
              />
            </Field>

            {/* Role */}
            <Field label="Job Title / Role" required error={errors.role}>
              <input
                type="text"
                value={form.role}
                onChange={set('role')}
                placeholder="e.g. Senior QA Engineer, SDE-2"
                className={inputCls(errors.role)}
              />
            </Field>

            {/* Status */}
            <Field label="Status">
              <select
                value={form.status}
                onChange={set('status')}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {COLUMNS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>

            {/* LinkedIn URL */}
            <Field label="LinkedIn Job URL" error={errors.linkedinUrl}>
              <input
                type="url"
                value={form.linkedinUrl}
                onChange={set('linkedinUrl')}
                placeholder="https://linkedin.com/jobs/view/..."
                className={inputCls(errors.linkedinUrl)}
              />
            </Field>

            {/* Resume + Date row */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Resume Used">
                <input
                  type="text"
                  value={form.resumeUsed}
                  onChange={set('resumeUsed')}
                  list="resume-suggestions"
                  placeholder="e.g. QA_Lead_v2"
                  className={inputCls()}
                />
                <datalist id="resume-suggestions">
                  {existingResumes.map((r) => (
                    <option key={r} value={r} />
                  ))}
                </datalist>
              </Field>

              <Field label="Date Applied">
                <input
                  type="date"
                  value={form.dateApplied}
                  onChange={set('dateApplied')}
                  className={inputCls()}
                />
              </Field>
            </div>

            {/* Salary Range */}
            <Field label="Salary Range">
              <input
                type="text"
                value={form.salaryRange}
                onChange={set('salaryRange')}
                placeholder="e.g. ₹25–30 LPA or $150–180K"
                className={inputCls()}
              />
            </Field>

            {/* Notes */}
            <Field label="Notes">
              <textarea
                value={form.notes}
                onChange={set('notes')}
                placeholder="Recruiter name, referral contact, interview details..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition"
              />
            </Field>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium transition shadow-sm"
            >
              {job ? 'Save Changes' : 'Add Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
