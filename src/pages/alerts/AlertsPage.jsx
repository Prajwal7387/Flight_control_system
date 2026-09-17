import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { getAlerts, markAlertAsRead, markAllAlertsAsRead } from '../../services/alertService';
import PageHeader from '../../components/common/PageHeader';
import SearchFilter from '../../components/common/SearchFilter';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatRelativeTime } from '../../utils/formatters';
import { Bell, BellOff, CheckCheck, AlertTriangle, Clock, XCircle, Plane, Info } from 'lucide-react';

const typeIcons = {
  delay: Clock,
  cancellation: XCircle,
  status_change: Plane,
  emergency: AlertTriangle,
  assignment: Plane,
  info: Info,
};

const typeColors = {
  delay: 'text-warning-600 bg-warning-50',
  cancellation: 'text-gray-600 bg-gray-100',
  status_change: 'text-primary-600 bg-primary-50',
  emergency: 'text-danger-600 bg-danger-50',
  assignment: 'text-blue-600 bg-blue-50',
  info: 'text-gray-500 bg-gray-50',
};

export default function AlertsPage() {
  const toast = useToast();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [readFilter, setReadFilter] = useState('');

  useEffect(() => { loadAlerts(); }, [search, typeFilter, readFilter]);

  const loadAlerts = async () => {
    try {
      const data = await getAlerts({ search, type: typeFilter, isRead: readFilter });
      setAlerts(data);
    } catch (error) {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markAlertAsRead(id);
      loadAlerts();
    } catch (error) {
      toast.error('Failed to mark alert');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAlertsAsRead();
      toast.success('All alerts marked as read');
      loadAlerts();
    } catch (error) {
      toast.error('Failed to update alerts');
    }
  };

  if (loading) return <LoadingSpinner message="Loading alerts..." />;

  const unreadCount = alerts.filter((a) => !a.is_read).length;

  return (
    <div className="page-container">
      <PageHeader
        title="Alerts"
        subtitle={`${unreadCount} unread alerts`}
        action={
          unreadCount > 0 && (
            <button className="btn-secondary" onClick={handleMarkAllRead}>
              <CheckCheck size={16} /> Mark All Read
            </button>
          )
        }
      />

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        placeholder="Search alerts..."
        filters={[
          {
            key: 'type', label: 'All Types', value: typeFilter, onChange: setTypeFilter,
            options: [
              { value: 'delay', label: 'Delay' },
              { value: 'cancellation', label: 'Cancellation' },
              { value: 'status_change', label: 'Status Change' },
              { value: 'emergency', label: 'Emergency' },
              { value: 'assignment', label: 'Assignment' },
              { value: 'info', label: 'Info' },
            ]
          },
          {
            key: 'read', label: 'All Alerts', value: readFilter, onChange: setReadFilter,
            options: [
              { value: 'false', label: 'Unread' },
              { value: 'true', label: 'Read' },
            ]
          },
        ]}
        className="mb-4"
      />

      <div className="space-y-2">
        {alerts.length === 0 ? (
          <div className="text-center py-16">
            <BellOff size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400">No alerts found</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const Icon = typeIcons[alert.type] || Info;
            const colorClass = typeColors[alert.type] || typeColors.info;
            return (
              <div
                key={alert.id}
                className={`bg-white rounded-lg border p-4 flex items-start gap-3 transition-colors ${
                  !alert.is_read ? 'border-primary-200 bg-primary-50/20' : 'border-gray-100'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className={`text-sm font-medium ${!alert.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                        {alert.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">{alert.message}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-400">{formatRelativeTime(alert.created_at)}</span>
                      {!alert.is_read && (
                        <button onClick={() => handleMarkRead(alert.id)} className="text-xs text-primary-600 hover:text-primary-700 font-medium whitespace-nowrap">
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                  {alert.flight && (
                    <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      Flight: {alert.flight.flight_number}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
