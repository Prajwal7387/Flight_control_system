import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { createRoute, updateRoute } from '../../services/routeService';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function RouteFormModal({ route, onClose, onSuccess }) {
  const toast = useToast();
  const isEdit = !!route;
  const [form, setForm] = useState({
    route_name: route?.route_name || '',
    source: route?.source || '',
    destination: route?.destination || '',
    distance_km: route?.distance_km || '',
    estimated_duration_minutes: route?.estimated_duration_minutes || '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.route_name.trim()) errs.route_name = 'Route name is required.';
    if (!form.source.trim()) errs.source = 'Source is required.';
    if (!form.destination.trim()) errs.destination = 'Destination is required.';
    if (!form.distance_km || Number(form.distance_km) <= 0) errs.distance_km = 'Distance must be positive.';
    if (!form.estimated_duration_minutes || Number(form.estimated_duration_minutes) <= 0) errs.estimated_duration_minutes = 'Duration must be positive.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { ...form, distance_km: Number(form.distance_km), estimated_duration_minutes: Number(form.estimated_duration_minutes) };
      if (isEdit) { await updateRoute(route.id, payload); toast.success('Route updated'); }
      else { await createRoute(payload); toast.success('Route created'); }
      onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to save route');
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={isEdit ? 'Edit Route' : 'Add Route'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Route Name" id="route_name" value={form.route_name} onChange={(e) => handleChange('route_name', e.target.value)} error={errors.route_name} placeholder="Mumbai-Delhi Express" required />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Source" id="source" value={form.source} onChange={(e) => handleChange('source', e.target.value)} error={errors.source} placeholder="Mumbai (BOM)" required />
          <Input label="Destination" id="destination" value={form.destination} onChange={(e) => handleChange('destination', e.target.value)} error={errors.destination} placeholder="Delhi (DEL)" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Distance (km)" id="distance_km" type="number" value={form.distance_km} onChange={(e) => handleChange('distance_km', e.target.value)} error={errors.distance_km} required />
          <Input label="Duration (minutes)" id="estimated_duration_minutes" type="number" value={form.estimated_duration_minutes} onChange={(e) => handleChange('estimated_duration_minutes', e.target.value)} error={errors.estimated_duration_minutes} required />
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>{isEdit ? 'Update' : 'Add'} Route</Button>
        </div>
      </form>
    </Modal>
  );
}
