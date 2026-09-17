import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getActiveFlights, updateFlightStatus } from '../../services/flightService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageHeader from '../../components/common/PageHeader';
import { formatDate, formatTime } from '../../utils/formatters';
import { Radio, RefreshCw, Plane } from 'lucide-react';

const statusFlow = ['scheduled', 'boarding', 'ready', 'in_flight', 'delayed', 'landed', 'completed'];

export default function FlightMonitorPage() {
  const { isAdmin, isOperator } = useAuth();
  const canUpdate = isAdmin || isOperator;
  const toast = useToast();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => { loadFlights(); }, []);

  const loadFlights = async () => {
    try {
      const data = await getActiveFlights();
      setFlights(data);
    } catch (error) {
      toast.error('Failed to load active flights');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (flightId, newStatus) => {
    setUpdating(flightId);
    try {
      await updateFlightStatus(flightId, newStatus);
      toast.success('Flight status updated');
      loadFlights();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading flight monitor..." />;

  return (
    <div className="page-container">
      <PageHeader
        title="Flight Monitor"
        subtitle={`${flights.length} active flights`}
        action={
          <button onClick={() => { setLoading(true); loadFlights(); }} className="btn-secondary">
            <RefreshCw size={16} /> Refresh
          </button>
        }
      />

      {flights.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Radio size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-600">No Active Flights</h3>
          <p className="text-sm text-gray-400 mt-1">All flights are either completed or cancelled.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {flights.map((f) => (
            <div key={f.id} className={`bg-white rounded-xl border p-5 transition-shadow hover:shadow-md ${
              f.status === 'emergency' ? 'border-danger-300 bg-danger-50/30' : 'border-gray-200'
            }`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    f.status === 'in_flight' ? 'bg-sky-100' :
                    f.status === 'emergency' ? 'bg-danger-100' : 'bg-primary-50'
                  }`}>
                    <Plane size={16} className={
                      f.status === 'in_flight' ? 'text-sky-600' :
                      f.status === 'emergency' ? 'text-danger-600' : 'text-primary-600'
                    } />
                  </div>
                  <span className="font-bold text-gray-900">{f.flight_number}</span>
                </div>
                <StatusBadge status={f.status} />
              </div>

              {/* Route */}
              <div className="flex items-center gap-2 text-sm mb-3">
                <span className="font-medium text-gray-700">{f.source}</span>
                <div className="flex-1 border-t border-dashed border-gray-300 mx-1" />
                <span className="font-medium text-gray-700">{f.destination}</span>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                <div>
                  <span className="text-gray-400">Aircraft:</span>
                  <p className="font-medium text-gray-700">{f.aircraft?.registration_number || '—'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Pilot:</span>
                  <p className="font-medium text-gray-700">{f.pilot?.name || '—'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Departure:</span>
                  <p className="font-medium text-gray-700">{formatDate(f.departure_date)} {formatTime(f.departure_time)}</p>
                </div>
                <div>
                  <span className="text-gray-400">Arrival:</span>
                  <p className="font-medium text-gray-700">{formatDate(f.arrival_date)} {formatTime(f.arrival_time)}</p>
                </div>
              </div>

              {/* Status progression */}
              {canUpdate && !['completed', 'cancelled', 'emergency'].includes(f.status) && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-2">Update Status:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {statusFlow
                      .filter((s) => s !== f.status)
                      .map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusUpdate(f.id, s)}
                          disabled={updating === f.id}
                          className="btn-secondary btn-sm text-[10px] px-2 py-1"
                        >
                          {s.replace('_', ' ')}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
