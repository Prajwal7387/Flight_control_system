import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getFlightStats, getRecentFlights } from '../../services/flightService';
import { getAircraftStats } from '../../services/aircraftService';
import { getPilotStats } from '../../services/pilotService';
import { getActiveEmergencies } from '../../services/emergencyService';
import { getRecentAlerts } from '../../services/alertService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Card from '../../components/ui/Card';
import { formatDate, formatTime, formatRelativeTime } from '../../utils/formatters';
import {
  Plane, PlaneTakeoff, PlaneLanding, Clock, AlertTriangle, Wrench,
  Users, CalendarClock, Plus, Radio, Bell, ArrowRight
} from 'lucide-react';

export default function DashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [flightStats, setFlightStats] = useState({});
  const [aircraftStats, setAircraftStats] = useState({});
  const [pilotStats, setPilotStats] = useState({});
  const [emergencies, setEmergencies] = useState([]);
  const [recentFlights, setRecentFlights] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [fs, as, ps, em, rf, ra] = await Promise.all([
        getFlightStats(),
        getAircraftStats(),
        getPilotStats(),
        getActiveEmergencies(),
        getRecentFlights(5),
        getRecentAlerts(5),
      ]);
      setFlightStats(fs);
      setAircraftStats(as);
      setPilotStats(ps);
      setEmergencies(em);
      setRecentFlights(rf);
      setRecentAlerts(ra);
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  const statCards = [
    { label: 'Total Flights', value: flightStats.total || 0, icon: Plane, color: 'text-primary-600 bg-primary-50' },
    { label: 'Scheduled', value: flightStats.scheduled || 0, icon: CalendarClock, color: 'text-blue-600 bg-blue-50' },
    { label: 'In Progress', value: (flightStats.in_flight || 0) + (flightStats.boarding || 0) + (flightStats.ready || 0), icon: PlaneTakeoff, color: 'text-sky-600 bg-sky-50' },
    { label: 'Completed', value: flightStats.completed || 0, icon: PlaneLanding, color: 'text-success-600 bg-success-50' },
    { label: 'Delayed', value: flightStats.delayed || 0, icon: Clock, color: 'text-warning-600 bg-warning-50' },
    { label: 'Available Aircraft', value: aircraftStats.available || 0, icon: Wrench, color: 'text-teal-600 bg-teal-50' },
    { label: 'Available Pilots', value: pilotStats.available || 0, icon: Users, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Active Emergencies', value: emergencies.length, icon: AlertTriangle, color: emergencies.length > 0 ? 'text-danger-600 bg-danger-50' : 'text-gray-600 bg-gray-50' },
  ];

  return (
    <div className="page-container">
      {/* Emergency banner */}
      {emergencies.length > 0 && (
        <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-xl animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-danger-600 animate-pulse" />
            <h3 className="font-semibold text-danger-800">Active Emergencies ({emergencies.length})</h3>
          </div>
          <div className="space-y-2">
            {emergencies.map((em) => (
              <div key={em.id} className="flex items-center justify-between text-sm">
                <span className="text-danger-700">
                  <span className="font-medium">{em.flight?.flight_number}</span> — {em.emergency_type.replace('_', ' ')} ({em.flight?.source} → {em.flight?.destination})
                </span>
                <StatusBadge status={em.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => (
          <Card key={card.label}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                <card.icon size={20} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      {profile?.role !== 'pilot' && (
        <div className="flex flex-wrap gap-3 mb-6">
          <button onClick={() => navigate('/flights')} className="btn-primary btn-sm">
            <Plus size={14} /> New Flight
          </button>
          <button onClick={() => navigate('/flight-monitor')} className="btn-secondary btn-sm">
            <Radio size={14} /> Monitor Flights
          </button>
          <button onClick={() => navigate('/reports')} className="btn-secondary btn-sm">
            <ArrowRight size={14} /> View Reports
          </button>
        </div>
      )}

      {/* Recent data grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent flights */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Flights</h3>
            <button onClick={() => navigate('/flights')} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
              View All →
            </button>
          </div>
          {recentFlights.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No flights found</p>
          ) : (
            <div className="space-y-3">
              {recentFlights.map((f) => (
                <div key={f.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{f.flight_number}</p>
                    <p className="text-xs text-gray-500">{f.source} → {f.destination}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={f.status} />
                    <p className="text-xs text-gray-400 mt-1">{formatDate(f.departure_date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent alerts */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Alerts</h3>
            <button onClick={() => navigate('/alerts')} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
              View All →
            </button>
          </div>
          {recentAlerts.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No alerts</p>
          ) : (
            <div className="space-y-3">
              {recentAlerts.map((a) => (
                <div key={a.id} className={`flex items-start gap-3 py-2 border-b border-gray-50 last:border-0 ${!a.is_read ? 'bg-primary-50/30 -mx-2 px-2 rounded' : ''}`}>
                  <Bell size={14} className={`mt-0.5 flex-shrink-0 ${a.type === 'emergency' ? 'text-danger-500' : 'text-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{a.title}</p>
                    <p className="text-xs text-gray-500 truncate">{a.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(a.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
