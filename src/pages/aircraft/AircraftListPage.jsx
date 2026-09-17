import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getAircraft, deleteAircraft } from '../../services/aircraftService';
import PageHeader from '../../components/common/PageHeader';
import SearchFilter from '../../components/common/SearchFilter';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import AircraftFormModal from './AircraftFormModal';
import { formatDate } from '../../utils/formatters';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

export default function AircraftListPage() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [aircraft, setAircraft] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAircraft, setEditingAircraft] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewAircraft, setViewAircraft] = useState(null);

  useEffect(() => { loadAircraft(); }, [search, statusFilter]);

  const loadAircraft = async () => {
    try {
      const data = await getAircraft({ search, status: statusFilter });
      setAircraft(data);
    } catch (error) {
      toast.error('Failed to load aircraft: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAircraft(deleteId);
      toast.success('Aircraft deleted successfully');
      setDeleteId(null);
      loadAircraft();
    } catch (error) {
      toast.error('Failed to delete aircraft: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    setModalOpen(false);
    setEditingAircraft(null);
    loadAircraft();
  };

  const statusOptions = [
    { value: 'available', label: 'Available' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'unavailable', label: 'Unavailable' },
  ];

  if (loading) return <LoadingSpinner message="Loading aircraft..." />;

  return (
    <div className="page-container">
      <PageHeader
        title="Aircraft Management"
        subtitle={`${aircraft.length} aircraft registered`}
        action={
          isAdmin && (
            <button className="btn-primary" onClick={() => { setEditingAircraft(null); setModalOpen(true); }}>
              <Plus size={16} /> Add Aircraft
            </button>
          )
        }
      />

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        placeholder="Search by registration, model, manufacturer..."
        filters={[{
          key: 'status',
          label: 'All Statuses',
          value: statusFilter,
          onChange: setStatusFilter,
          options: statusOptions,
        }]}
        className="mb-4"
      />

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Registration</th>
                <th>Model</th>
                <th>Manufacturer</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Last Maintenance</th>
                {isAdmin && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {aircraft.length === 0 ? (
                <tr><td colSpan={isAdmin ? 7 : 6} className="text-center py-8 text-gray-400">No aircraft found</td></tr>
              ) : (
                aircraft.map((a) => (
                  <tr key={a.id}>
                    <td className="font-medium text-gray-900">{a.registration_number}</td>
                    <td>{a.model}</td>
                    <td>{a.manufacturer}</td>
                    <td>{a.capacity}</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td>{formatDate(a.last_maintenance_date)}</td>
                    {isAdmin && (
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setViewAircraft(a)} className="btn-ghost btn-sm" title="View"><Eye size={14} /></button>
                          <button onClick={() => { setEditingAircraft(a); setModalOpen(true); }} className="btn-ghost btn-sm" title="Edit"><Edit size={14} /></button>
                          <button onClick={() => setDeleteId(a.id)} className="btn-ghost btn-sm text-danger-500 hover:text-danger-700" title="Delete"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View modal */}
      {viewAircraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setViewAircraft(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
            <h2 className="text-lg font-semibold mb-4">Aircraft Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Registration</span><span className="font-medium">{viewAircraft.registration_number}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Model</span><span className="font-medium">{viewAircraft.model}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Manufacturer</span><span className="font-medium">{viewAircraft.manufacturer}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Capacity</span><span className="font-medium">{viewAircraft.capacity} passengers</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><StatusBadge status={viewAircraft.status} /></div>
              <div className="flex justify-between"><span className="text-gray-500">Last Maintenance</span><span className="font-medium">{formatDate(viewAircraft.last_maintenance_date)}</span></div>
            </div>
            <button onClick={() => setViewAircraft(null)} className="btn-secondary w-full mt-6">Close</button>
          </div>
        </div>
      )}

      {/* Form modal */}
      {modalOpen && (
        <AircraftFormModal
          aircraft={editingAircraft}
          onClose={() => { setModalOpen(false); setEditingAircraft(null); }}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Aircraft"
        message="Are you sure you want to delete this aircraft? This action cannot be undone."
      />
    </div>
  );
}
