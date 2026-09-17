const statusColors = {
  // Flight statuses
  scheduled: 'bg-blue-100 text-blue-700',
  boarding: 'bg-indigo-100 text-indigo-700',
  ready: 'bg-cyan-100 text-cyan-700',
  in_flight: 'bg-sky-100 text-sky-700',
  delayed: 'bg-warning-50 text-warning-600',
  landed: 'bg-teal-100 text-teal-700',
  completed: 'bg-success-50 text-success-600',
  cancelled: 'bg-gray-100 text-gray-600',
  emergency: 'bg-danger-50 text-danger-600',
  // Aircraft statuses
  available: 'bg-success-50 text-success-600',
  assigned: 'bg-blue-100 text-blue-700',
  maintenance: 'bg-warning-50 text-warning-600',
  unavailable: 'bg-gray-100 text-gray-600',
  // Pilot statuses
  on_leave: 'bg-orange-100 text-orange-700',
  // Emergency statuses
  reported: 'bg-warning-50 text-warning-600',
  active: 'bg-danger-50 text-danger-600',
  resolved: 'bg-success-50 text-success-600',
};

const statusLabels = {
  in_flight: 'In Flight',
  on_leave: 'On Leave',
  scheduled: 'Scheduled',
  boarding: 'Boarding',
  ready: 'Ready',
  delayed: 'Delayed',
  landed: 'Landed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  emergency: 'Emergency',
  available: 'Available',
  assigned: 'Assigned',
  maintenance: 'Maintenance',
  unavailable: 'Unavailable',
  reported: 'Reported',
  active: 'Active',
  resolved: 'Resolved',
};

export default function StatusBadge({ status, className = '' }) {
  const colorClass = statusColors[status] || 'bg-gray-100 text-gray-600';
  const label = statusLabels[status] || status;

  return (
    <span className={`badge ${colorClass} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === 'emergency' || status === 'active'
          ? 'bg-danger-500 animate-pulse'
          : 'bg-current opacity-60'
      }`} />
      {label}
    </span>
  );
}
