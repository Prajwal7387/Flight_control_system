import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { createAircraft, updateAircraft } from '../../services/aircraftService';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

export default function AircraftFormModal({ aircraft, onClose, onSuccess }) {
  const toast = useToast();
  const isEdit = !!aircraft;

  const [form, setForm] = useState({
    registration_number: aircraft?.registration_number || '',
    model: aircraft?.model || '',
    manufacturer: aircraft?.manufacturer || '',
    capacity: aircraft?.capacity || '',
    status: aircraft?.status || 'available',
    last_maintenance_date: aircraft?.last_maintenance_date || '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.registration_number.trim()) errs.registration_number = 'Registration number is required.';
    if (!form.model.trim()) errs.model = 'Model is required.';
    if (!form.manufacturer.trim()) errs.manufacturer = 'Manufacturer is required.';
    if (!form.capacity || Number(form.capacity) <= 0) errs.capacity = 'Capacity must be a positive number.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = { ...form, capacity: Number(form.capacity) };
      if (isEdit) {
        await updateAircraft(aircraft.id, payload);
        toast.success('Aircraft updated successfully');
      } else {
        await createAircraft(payload);
        toast.success('Aircraft added successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to save aircraft');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'available', label: 'Available' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'maintenance', label: 'In Maintenance' },
    { value: 'unavailable', label: 'Unavailable' },
  ];

  return (
    <Modal isOpen={true} onClose={onClose} title={isEdit ? 'Edit Aircraft' : 'Add Aircraft'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Registration Number"
          id="registration_number"
          value={form.registration_number}
          onChange={(e) => handleChange('registration_number', e.target.value)}
          error={errors.registration_number}
          placeholder="e.g. VT-ANA"
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Model"
            id="model"
            value={form.model}
            onChange={(e) => handleChange('model', e.target.value)}
            error={errors.model}
            placeholder="e.g. Boeing 737-800"
            required
          />
          <Input
            label="Manufacturer"
            id="manufacturer"
            value={form.manufacturer}
            onChange={(e) => handleChange('manufacturer', e.target.value)}
            error={errors.manufacturer}
            placeholder="e.g. Boeing"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Capacity"
            id="capacity"
            type="number"
            value={form.capacity}
            onChange={(e) => handleChange('capacity', e.target.value)}
            error={errors.capacity}
            placeholder="e.g. 189"
            required
          />
          <Select
            label="Status"
            id="status"
            value={form.status}
            onChange={(e) => handleChange('status', e.target.value)}
            options={statusOptions}
          />
        </div>
        <Input
          label="Last Maintenance Date"
          id="last_maintenance_date"
          type="date"
          value={form.last_maintenance_date}
          onChange={(e) => handleChange('last_maintenance_date', e.target.value)}
        />
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>{isEdit ? 'Update' : 'Add'} Aircraft</Button>
        </div>
      </form>
    </Modal>
  );
}
