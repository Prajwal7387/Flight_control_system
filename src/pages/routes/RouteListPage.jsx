import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getRoutes, deleteRoute } from '../../services/routeService';
import PageHeader from '../../components/common/PageHeader';
import SearchFilter from '../../components/common/SearchFilter';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import RouteFormModal from './RouteFormModal';
import { Plus, Edit, Trash2, Eye, MapPin } from 'lucide-react';

export default function RouteListPage() {
  const { isOperator, isAdmin } = useAuth();
  const canEdit = isOperator || isAdmin;
  const toast = useToast();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { loadRoutes(); }, [search]);

  const loadRoutes = async () => {
    try {
      const data = await getRoutes({ search });
      setRoutes(data);
    } catch (error) {
      toast.error('Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteRoute(deleteId);
      toast.success('Route deleted');
      setDeleteId(null);
      loadRoutes();
    } catch (error) {
      toast.error('Failed to delete route');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading routes..." />;

  return (
    <div className="page-container">
      <PageHeader
        title="Route Management"
        subtitle={`${routes.length} routes configured`}
        action={canEdit && (
          <button className="btn-primary" onClick={() => { setEditingRoute(null); setModalOpen(true); }}><Plus size={16} /> Add Route</button>
        )}
      />

      <SearchFilter searchValue={search} onSearchChange={setSearch} placeholder="Search by name, source, destination..." className="mb-4" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {routes.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">No routes found</div>
        ) : (
          routes.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                    <MapPin size={16} className="text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{r.route_name}</h3>
                </div>
                {canEdit && (
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingRoute(r); setModalOpen(true); }} className="btn-ghost btn-sm"><Edit size={14} /></button>
                    <button onClick={() => setDeleteId(r.id)} className="btn-ghost btn-sm text-danger-500"><Trash2 size={14} /></button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <span className="font-medium">{r.source}</span>
                <span className="text-gray-300">→</span>
                <span className="font-medium">{r.destination}</span>
              </div>
              <div className="flex gap-4 text-xs text-gray-500">
                <span>{r.distance_km} km</span>
                <span>{r.estimated_duration_minutes} min</span>
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && <RouteFormModal route={editingRoute} onClose={() => { setModalOpen(false); setEditingRoute(null); }} onSuccess={() => { setModalOpen(false); setEditingRoute(null); loadRoutes(); }} />}
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} title="Delete Route" message="Are you sure? This cannot be undone." />
    </div>
  );
}
