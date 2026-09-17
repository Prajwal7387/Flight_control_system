import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getEmergencies, resolveEmergency } from '../../services/emergencyService';
import { getFlights } from '../../services/flightService';
import PageHeader from '../../components/common/PageHeader';
import SearchFilter from '../../components/common/SearchFilter';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmergencyFormModal from './EmergencyFormModal';
import { formatDate, formatRelativeTime, formatStatus } from '../../utils/formatters';
import { AlertTriangle, Plus, CheckCircle } from 'lucide-react';

export default function EmergencyListPage() {
  const { isAdmin, isOperator, isPilot } = useAuth();
  const toast = useToast();
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => { loadEmergencies(); }, [search, statusFilter]);

  const loadEmergencies = async () => {
    try {
      const data = await getEmergencies({ search, status: statusFilter });
      setEmergencies(data);
    } catch (error) {
      toast.error('Failed to load emergencies');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await resolveEmergency(id);
      toast.success('Emergency resolved');
      loadEmergencies();
    } catch (error) {
      toast.error('Failed to resolve emergency');
    }
  };

  const statusOptions = [
    { value: 'reported', label: 'Reported' },
    { value: 'active', label: 'Active' },
    { value: 'resolved', label: 'Resolved' },
  ];

  if (loading) return <LoadingSpinner message="Loading emergencies..." />;

  return (
    <div className="page-container">
      <PageHeader
        title="Emergency Management"
        subtitle={`${emergencies.length} emergency records`}
        action={
          (isPilot || isOperator) && (
            <button className="btn-danger" onClick={() => setModalOpen(true)}>
              <AlertTriangle size={16} /> Report Emergency
            </button>
          )
        }
      />

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        placeholder="Search emergencies..."
        filters={[{ key: 'status', label: 'All Statuses', value: statusFilter, onChange: setStatusFilter, options: statusOptions }]}
        className="mb-4"
      />

      <div className="space-y-3">
        {emergencies.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No emergencies found</div>
        ) : (
          emergencies.map((em) => (
            <div key={em.id} className={`bg-white rounded-xl border p-5 ${
              em.status !== 'resolved' ? 'border-danger-200 bg-danger-50/20' : 'border-gray-200'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    em.status === 'resolved' ? 'bg-success-50' : 'bg-danger-100'
                  }`}>
                    {em.status === 'resolved'
                      ? <CheckCircle size={20} className="text-success-600" />
                      : <AlertTriangle size={20} className="text-danger-600" />
                    }
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{formatStatus(em.emergency_type)}</h3>
                      <StatusBadge status={em.status} />
                    </div>
                    {em.flight && (
                      <p className="text-sm text-gray-600 mb-1">
                        Flight <span className="font-semibold">{em.flight.flight_number}</span> ({em.flight.source} → {em.flight.destination})
                      </p>
                    )}
                    <p className="text-sm text-gray-500">{em.description}</p>
                    <p className="text-xs text-gray-400 mt-2">Reported {formatRelativeTime(em.reported_at)}</p>
                  </div>
                </div>
                {(isAdmin || isOperator) && em.status !== 'resolved' && (
                  <button onClick={() => handleResolve(em.id)} className="btn-secondary btn-sm text-success-600 flex-shrink-0">
                    <CheckCircle size={14} /> Resolve
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && <EmergencyFormModal onClose={() => setModalOpen(false)} onSuccess={() => { setModalOpen(false); loadEmergencies(); }} />}
    </div>
  );
}
