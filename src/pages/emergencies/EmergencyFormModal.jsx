import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { createEmergency } from '../../services/emergencyService';
import { getFlights } from '../../services/flightService';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

export default function EmergencyFormModal({ onClose, onSuccess }) {
  const { profile } = useAuth();
  const toast = useToast();
  const [flights, setFlights] = useState([]);
  const [form, setForm] = useState({
    flight_id: '',
    emergency_type: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFlights();
  }, []);

  const loadFlights = async () => {
    try {
      const data = await getFlights({ status: '' });
      // Only show flights that are not completed/cancelled
      setFlights(data.filter((f) => !['completed', 'cancelled'].includes(f.status)));
    } catch (error) {
      toast.error('Failed to load flights');
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.flight_id) errs.flight_id = 'Please select a flight.';
    if (!form.emergency_type) errs.emergency_type = 'Emergency type is required.';
    if (!form.description.trim()) errs.description = 'Description is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await createEmergency({
        ...form,
        reported_by: profile?.id,
      });
      toast.success('Emergency reported successfully');
      onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to report emergency');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Report Emergency" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-sm text-danger-700">
          ⚠️ Report an emergency for an active flight. This will update the flight status and create an alert.
        </div>

        <Select
          label="Flight"
          id="flight_id"
          value={form.flight_id}
          onChange={(e) => handleChange('flight_id', e.target.value)}
          error={errors.flight_id}
          placeholder="Select a flight..."
          options={flights.map((f) => ({ value: f.id, label: `${f.flight_number} (${f.source} → ${f.destination})` }))}
          required
        />

        <Select
          label="Emergency Type"
          id="emergency_type"
          value={form.emergency_type}
          onChange={(e) => handleChange('emergency_type', e.target.value)}
          error={errors.emergency_type}
          placeholder="Select type..."
          options={[
            { value: 'technical', label: 'Technical Issue' },
            { value: 'medical', label: 'Medical Emergency' },
            { value: 'weather', label: 'Weather Issue' },
            { value: 'communication', label: 'Communication Issue' },
            { value: 'other', label: 'Other' },
          ]}
          required
        />

        <div>
          <label htmlFor="description" className="form-label">
            Description <span className="text-danger-500">*</span>
          </label>
          <textarea
            id="description"
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className={`form-input ${errors.description ? 'border-danger-500' : ''}`}
            placeholder="Describe the emergency situation..."
            required
          />
          {errors.description && <p className="mt-1 text-xs text-danger-500">{errors.description}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="danger" type="submit" loading={loading}>Report Emergency</Button>
        </div>
      </form>
    </Modal>
  );
}
