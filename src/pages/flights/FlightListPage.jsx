import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getFlights, updateFlightStatus } from '../../services/flightService';
import PageHeader from '../../components/common/PageHeader';
import SearchFilter from '../../components/common/SearchFilter';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import FlightFormModal from './FlightFormModal';
import { formatDate, formatTime } from '../../utils/formatters';
import { Plus, Eye } from 'lucide-react';

export default function FlightListPage() {
  const { isAdmin, isOperator, isPilot } = useAuth();
  const canCreate = isAdmin || isOperator;
  const toast = useToast();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);
  const [viewFlight, setViewFlight] = useState(null);

  useEffect(() => { loadFlights(); }, [search, statusFilter]);

  const loadFlights = async () => {
    try {
      const data = await getFlights({ search, status: statusFilter });
      setFlights(data);
    } catch (error) {
      toast.error('Failed to load flights');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'boarding', label: 'Boarding' },
    { value: 'ready', label: 'Ready' },
    { value: 'in_flight', label: 'In Flight' },
    { value: 'delayed', label: 'Delayed' },
    { value: 'landed', label: 'Landed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'emergency', label: 'Emergency' },
  ];

  if (loading) return <LoadingSpinner message="Loading flights..." />;

  return (
    <div className="page-container">
      <PageHeader
        title="Flight Management"
        subtitle={`${flights.length} flights`}
        action={canCreate && (
          <button className="btn-primary" onClick={() => { setEditingFlight(null); setModalOpen(true); }}><Plus size={16} /> Schedule Flight</button>
        )}
      />

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        placeholder="Search by flight number, source, destination..."
        filters={[{ key: 'status', label: 'All Statuses', value: statusFilter, onChange: setStatusFilter, options: statusOptions }]}
        className="mb-4"
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Flight</th>
                <th>Route</th>
                <th>Aircraft</th>
                <th>Pilot</th>
                <th>Departure</th>
                <th>Arrival</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {flights.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">No flights found</td></tr>
              ) : (
                flights.map((f) => (
                  <tr key={f.id} className={f.status === 'emergency' ? 'bg-danger-50/50' : ''}>
                    <td className="font-semibold text-gray-900">{f.flight_number}</td>
                    <td>
                      <div className="text-sm">{f.source}</div>
                      <div className="text-xs text-gray-400">→ {f.destination}</div>
                    </td>
                    <td className="text-xs">{f.aircraft?.registration_number || '—'}</td>
                    <td className="text-xs">{f.pilot?.name || '—'}</td>
                    <td className="text-xs">{formatDate(f.departure_date)} {formatTime(f.departure_time)}</td>
                    <td className="text-xs">{formatDate(f.arrival_date)} {formatTime(f.arrival_time)}</td>
                    <td><StatusBadge status={f.status} /></td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewFlight(f)} className="btn-ghost btn-sm"><Eye size={14} /></button>
                        {canCreate && !['completed', 'cancelled'].includes(f.status) && (
                          <button onClick={() => { setEditingFlight(f); setModalOpen(true); }} className="btn-ghost btn-sm text-primary-600 text-xs">Edit</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View flight details */}
      {viewFlight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setViewFlight(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-slide-up max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Flight {viewFlight.flight_number}</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Route</span><span className="font-medium">{viewFlight.source} → {viewFlight.destination}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Aircraft</span><span className="font-medium">{viewFlight.aircraft?.registration_number} ({viewFlight.aircraft?.model})</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Pilot</span><span className="font-medium">{viewFlight.pilot?.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Departure</span><span className="font-medium">{formatDate(viewFlight.departure_date)} {formatTime(viewFlight.departure_time)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Arrival</span><span className="font-medium">{formatDate(viewFlight.arrival_date)} {formatTime(viewFlight.arrival_time)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><StatusBadge status={viewFlight.status} /></div>
              {viewFlight.route && (
                <>
                  <div className="flex justify-between"><span className="text-gray-500">Route Name</span><span className="font-medium">{viewFlight.route.route_name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Distance</span><span className="font-medium">{viewFlight.route.distance_km} km</span></div>
                </>
              )}
            </div>

            {/* Status update (for operators/admins) */}
            {canCreate && !['completed', 'cancelled'].includes(viewFlight.status) && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-2">Update Status:</p>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.filter((s) => s.value !== viewFlight.status).map((s) => (
                    <button
                      key={s.value}
                      onClick={async () => {
                        try {
                          await updateFlightStatus(viewFlight.id, s.value);
                          toast.success(`Flight status updated to ${s.label}`);
                          setViewFlight(null);
                          loadFlights();
                        } catch (err) {
                          toast.error(err.message);
                        }
                      }}
                      className="btn-secondary btn-sm text-xs"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => setViewFlight(null)} className="btn-secondary w-full mt-4">Close</button>
          </div>
        </div>
      )}

      {modalOpen && <FlightFormModal flight={editingFlight} onClose={() => { setModalOpen(false); setEditingFlight(null); }} onSuccess={() => { setModalOpen(false); setEditingFlight(null); loadFlights(); }} />}
    </div>
  );
}
