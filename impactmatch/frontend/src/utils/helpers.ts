export const urgencyConfig = {
  critical: { label: 'Critical', color: 'urgency-critical', dot: 'bg-red-400' },
  high:     { label: 'High',     color: 'urgency-high',     dot: 'bg-orange-400' },
  medium:   { label: 'Medium',   color: 'urgency-medium',   dot: 'bg-yellow-400' },
  low:      { label: 'Low',      color: 'urgency-low',      dot: 'bg-brand-400' },
} as const;

export const getBadge = (credits: number) => {
  if (credits >= 2100) return { label: 'Legend',      emoji: '🏆', next: null,  progress: 100 };
  if (credits >= 900)  return { label: 'Champion',    emoji: '⭐', next: 2100, progress: Math.round(((credits - 900) / 1200) * 100) };
  if (credits >= 300)  return { label: 'Contributor', emoji: '🌿', next: 900,  progress: Math.round(((credits - 300) / 600) * 100) };
  return                      { label: 'Seedling',    emoji: '🌱', next: 300,  progress: Math.round((credits / 300) * 100) };
};

export const creditsByUrgency: Record<string, number> = {
  critical: 500, high: 300, medium: 150, low: 75,
};

export const SKILLS_OPTIONS = [
  'First Aid', 'Driving', 'Teaching', 'Medical', 'Cooking', 'Carpentry',
  'Counseling', 'Data Entry', 'Photography', 'Social Media', 'Translation',
  'Web Dev', 'Fundraising', 'Logistics', 'Construction', 'Animal Care',
  'Legal Aid', 'Mental Health', 'Sign Language', 'Plumbing',
];

export const DAYS_OPTIONS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const CATEGORY_OPTIONS = [
  'Disaster Relief', 'Medical', 'Education', 'Environment', 'Food',
  'Elder Care', 'Animal Care', 'Community', 'Tech Support', 'Other',
];

export const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

export const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};
