export function formatDateTime(value: string | null) {
  if (!value) {
    return 'Not set';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatDate(value: string | null) {
  if (!value) {
    return 'Not set';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

export function badgeTone(status: string) {
  const normalized = status.toLowerCase();
  if (['active', 'approved', 'submitted', 'accepted', 'enrolled', 'open'].includes(normalized)) {
    return 'success';
  }
  if (['draft', 'pending'].includes(normalized)) {
    return 'muted';
  }
  if (['rejected', 'withdrawn', 'archived', 'closed', 'disabled', 'suspended'].includes(normalized)) {
    return 'danger';
  }
  if (['interview_scheduled', 'offered'].includes(normalized)) {
    return 'warning';
  }
  return 'neutral';
}

export function statusLabel(value: string) {
  return value
    .replace(/_/g, ' ')
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
