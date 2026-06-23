export const generateId = () =>
  `j_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export const daysSince = (dateStr) => {
  if (!dateStr) return null;
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  if (days < 0) return 'Future';
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
  return `${days}d ago`;
};

export const todayISO = () => new Date().toISOString().split('T')[0];

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};
