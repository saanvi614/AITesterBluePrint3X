export const COLUMNS = [
  { id: 'wishlist',  label: 'Wishlist',   color: '#3b82f6', dot: 'bg-blue-500'   },
  { id: 'applied',   label: 'Applied',    color: '#60a5fa', dot: 'bg-blue-400'   },
  { id: 'followup',  label: 'Follow-up',  color: '#f59e0b', dot: 'bg-amber-500'  },
  { id: 'interview', label: 'Interview',  color: '#a855f7', dot: 'bg-purple-500' },
  { id: 'offer',     label: 'Offer',      color: '#22c55e', dot: 'bg-green-500'  },
  { id: 'rejected',  label: 'Rejected',   color: '#ef4444', dot: 'bg-red-500'    },
];

export const PRIORITY_STYLES = {
  high:   'bg-red-500/20 text-red-400 border border-red-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  low:    'bg-green-500/20 text-green-400 border border-green-500/30',
};

export const LOCATION_STYLES = {
  'remote':  'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  'on-site': 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  'hybrid':  'bg-purple-500/20 text-purple-400 border border-purple-500/30',
};

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'company', label: 'Company A-Z' },
];
