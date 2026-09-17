import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  getFlightReport, getAircraftReport, getPilotReport,
  getEmergencyReport, getScheduleReport
} from '../../services/reportService';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { exportToCSV } from '../../utils/exportCSV';
import { formatDate, formatTime, formatStatus, formatRelativeTime } from '../../utils/formatters';
import { FileBarChart, Download, Plane, Wrench, Users, AlertTriangle, CalendarClock } from 'lucide-react';

const reportTypes = [
  { key: 'flight', label: 'Flight Report', icon: Plane },
  { key: 'aircraft', label: 'Aircraft Report', icon: Wrench },
  { key: 'pilot', label: 'Pilot Report', icon: Users },
  { key: 'emergency', label: 'Emergency Report', icon: AlertTriangle },
  { key: 'schedule', label: 'Schedule Report', icon: CalendarClock },
];

export default function ReportsPage() {
  const toast = useToast();
  const [activeReport, setActiveReport] = useState('flight');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [generated, setGenerated] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    setGenerated(false);
    try {
      let result;
      const filters = { startDate, endDate };
      switch (activeReport) {
        case 'flight': result = await getFlightReport(filters); break;
        case 'aircraft': result = await getAircraftReport(); break;
        case 'pilot': result = await getPilotReport(); break;
        case 'emergency': result = await getEmergencyReport(filters); break;
        case 'schedule': result = await getScheduleReport(filters); break;
        default: result = [];
      }
      setData(result);
      setGenerated(true);
      toast.success(`${reportTypes.find((r) => r.key === activeReport)?.label} generated`);
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const columns = getColumns();
    exportToCSV(data, `${activeReport}_report`, columns);
    toast.success('CSV exported');
  };

  const getColumns = () => {
    switch (activeReport) {
      case 'flight': return [
        { key: 'flight_number', label: 'Flight' },
        { key: 'source', label: 'Source' },
        { key: 'destination', label: 'Destination' },
        { key: 'departure_date', label: 'Departure Date' },
        { key: 'departure_time', label: 'Departure Time' },
        { key: 'status', label: 'Status' },
      ];
      case 'aircraft': return [
        { key: 'registration_number', label: 'Registration' },
        { key: 'model', label: 'Model' },
        { key: 'manufacturer', label: 'Manufacturer' },
        { key: 'capacity', label: 'Capacity' },
        { key: 'status', label: 'Status' },
        { key: 'total_flights', label: 'Total Flights' },
        { key: 'completed_flights', label: 'Completed' },
      ];
      case 'pilot': return [
        { key: 'name', label: 'Name' },
        { key: 'license_number', label: 'License' },
        { key: 'experience_years', label: 'Experience (yrs)' },
        { key: 'status', label: 'Status' },
        { key: 'total_flights', label: 'Total Flights' },
        { key: 'completed_flights', label: 'Completed' },
      ];
      case 'emergency': return [
        { key: 'emergency_type', label: 'Type' },
        { key: 'description', label: 'Description' },
        { key: 'status', label: 'Status' },
        { key: 'reported_at', label: 'Reported' },
      ];
      case 'schedule': return [
        { key: 'flight_number', label: 'Flight' },
        { key: 'source', label: 'Source' },
        { key: 'destination', label: 'Destination' },
        { key: 'departure_date', label: 'Date' },
        { key: 'departure_time', label: 'Time' },
        { key: 'status', label: 'Status' },
      ];
      default: return [];
    }
  };

  // Summary stats
  const getSummary = () => {
    if (!generated || !data.length) return null;
    switch (activeReport) {
      case 'flight': {
        const statusCounts = {};
        data.forEach((f) => { statusCounts[f.status] = (statusCounts[f.status] || 0) + 1; });
        return Object.entries(statusCounts).map(([s, c]) => ({ label: formatStatus(s), value: c }));
      }
      case 'aircraft': return [
        { label: 'Total Aircraft', value: data.length },
        { label: 'Available', value: data.filter((a) => a.status === 'available').length },
        { label: 'Total Flights Assigned', value: data.reduce((s, a) => s + a.total_flights, 0) },
      ];
      case 'pilot': return [
        { label: 'Total Pilots', value: data.length },
        { label: 'Available', value: data.filter((p) => p.status === 'available').length },
        { label: 'Total Flights Completed', value: data.reduce((s, p) => s + p.completed_flights, 0) },
      ];
      case 'emergency': return [
        { label: 'Total', value: data.length },
        { label: 'Active', value: data.filter((e) => e.status !== 'resolved').length },
        { label: 'Resolved', value: data.filter((e) => e.status === 'resolved').length },
      ];
      default: return [{ label: 'Total Records', value: data.length }];
    }
  };

  const columns = getColumns();
  const summary = getSummary();

  return (
    <div className="page-container">
      <PageHeader title="Reports" subtitle="Generate and export operational reports" />

      {/* Report type selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {reportTypes.map((rt) => (
          <button
            key={rt.key}
            onClick={() => { setActiveReport(rt.key); setGenerated(false); setData([]); }}
            className={`btn ${activeReport === rt.key ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            <rt.icon size={14} /> {rt.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row items-end gap-4">
          {['flight', 'emergency', 'schedule'].includes(activeReport) && (
            <>
              <div>
                <label className="form-label">Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="form-label">End Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="form-input" />
              </div>
            </>
          )}
          <Button onClick={generateReport} loading={loading}>
            <FileBarChart size={16} /> Generate Report
          </Button>
          {generated && data.length > 0 && (
            <Button variant="secondary" onClick={handleExportCSV}>
              <Download size={16} /> Export CSV
            </Button>
          )}
        </div>
      </Card>

      {loading && <LoadingSpinner message="Generating report..." />}

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {summary.map((s) => (
            <Card key={s.label}>
              <p className="text-xs text-gray-500 uppercase">{s.label}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{s.value}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Report data table */}
      {generated && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={columns.length} className="text-center py-8 text-gray-400">No data found</td></tr>
                ) : (
                  data.map((row, i) => (
                    <tr key={row.id || i}>
                      {columns.map((col) => (
                        <td key={col.key}>
                          {col.key === 'status' ? (
                            <StatusBadge status={row[col.key]} />
                          ) : col.key === 'departure_date' || col.key === 'last_maintenance_date' ? (
                            formatDate(row[col.key])
                          ) : col.key === 'departure_time' || col.key === 'arrival_time' ? (
                            formatTime(row[col.key])
                          ) : col.key === 'reported_at' ? (
                            formatRelativeTime(row[col.key])
                          ) : col.key === 'emergency_type' ? (
                            formatStatus(row[col.key])
                          ) : (
                            String(row[col.key] ?? '—')
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
