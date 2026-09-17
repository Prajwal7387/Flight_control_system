import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getPilots, deletePilot } from '../../services/pilotService';
import PageHeader from '../../components/common/PageHeader';
import SearchFilter from '../../components/common/SearchFilter';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import PilotFormModal from './PilotFormModal';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

export default function PilotListPage() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [pilots, setPilots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPilot, setEditingPilot] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewPilot, setViewPilot] = useState(null);

  useEffect(() => { loadPilots(); }, [search, statusFilter]);

  const loadPilots = async () => {
    try {
      const data = await getPilots({ search, status: statusFilter });
      setPilots(data);
    } catch (error) {
      toast.error('Failed to load pilots: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deletePilot(deleteId);
      toast.success('Pilot deleted successfully');
      setDeleteId(null);
      loadPilots();
    } catch (error) {
      toast.error('Failed to delete: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  const statusOptions = [
    { value: 'available', label: 'Available' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'on_leave', label: 'On Leave' },
    { value: 'unavailable', label: 'Unavailable' },
  ];

  if (loading) return <LoadingSpinner message="Loading pilots..." />;

  return (
    <div className="page-container">
      <PageHeader
        title="Pilot Management"
        subtitle={`${pilots.length} pilots registered`}
        action={isAdmin && (
          <button className="btn-primary" onClick={() => { setEditingPilot(null); setModalOpen(true); }}><Plus size={16} /> Add Pilot</button>
        )}
      />

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        placeholder="Search by name, email, license..."
        filters={[{ key: 'status', label: 'All Statuses', value: statusFilter, onChange: setStatusFilter, options: statusOptions }]}
        className="mb-4"
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>License Number</th>
                <th>Experience</th>
                <th>Status</th>
                {isAdmin && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {pilots.length === 0 ? (
                <tr><td colSpan={isAdmin ? 6 : 5} className="text-center py-8 text-gray-400">No pilots found</td></tr>
              ) : (
                pilots.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium text-gray-900">{p.name}</td>
                    <td>{p.email}</td>
                    <td className="font-mono text-xs">{p.license_number}</td>
                    <td>{p.experience_years} years</td>
                    <td><StatusBadge status={p.status} /></td>
                    {isAdmin && (
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setViewPilot(p)} className="btn-ghost btn-sm"><Eye size={14} /></button>
                          <button onClick={() => { setEditingPilot(p); setModalOpen(true); }} className="btn-ghost btn-sm"><Edit size={14} /></button>
                          <button onClick={() => setDeleteId(p.id)} className="btn-ghost btn-sm text-danger-500"><Trash2 size={14} /></button>
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

      {viewPilot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setViewPilot(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
            <h2 className="text-lg font-semibold mb-4">Pilot Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium">{viewPilot.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-medium">{viewPilot.email}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="font-medium">{viewPilot.phone || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">License</span><span className="font-medium font-mono text-xs">{viewPilot.license_number}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Experience</span><span className="font-medium">{viewPilot.experience_years} years</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><StatusBadge status={viewPilot.status} /></div>
            </div>
            <button onClick={() => setViewPilot(null)} className="btn-secondary w-full mt-6">Close</button>
          </div>
        </div>
      )}

      {modalOpen && <PilotFormModal pilot={editingPilot} onClose={() => { setModalOpen(false); setEditingPilot(null); }} onSuccess={() => { setModalOpen(false); setEditingPilot(null); loadPilots(); }} />}
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} title="Delete Pilot" message="Are you sure? This cannot be undone." />
    </div>
  );
}
