/**
 * Format a date string to a readable format
 */
export function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a time string (HH:MM) to 12-hour format
 */
export function formatTime(time) {
  if (!time) return '—';
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

/**
 * Format date and time together
 */
export function formatDateTime(date, time) {
  if (!date) return '—';
  return `${formatDate(date)} ${time ? formatTime(time) : ''}`.trim();
}

/**
 * Format a timestamp to relative time
 */
export function formatRelativeTime(timestamp) {
  if (!timestamp) return '—';
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(timestamp);
}

/**
 * Format number with commas
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString('en-IN');
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format status for display (replace underscores with spaces)
 */
export function formatStatus(status) {
  if (!status) return '';
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}
