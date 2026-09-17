import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { createPilot, updatePilot } from '../../services/pilotService';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

export default function PilotFormModal({ pilot, onClose, onSuccess }) {
  const toast = useToast();
  const isEdit = !!pilot;
  const [form, setForm] = useState({
    name: pilot?.name || '',
    email: pilot?.email || '',
    phone: pilot?.phone || '',
    license_number: pilot?.license_number || '',
    experience_years: pilot?.experience_years || '',
    status: pilot?.status || 'available',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.email.trim()) errs.email = 'Email is required.';
    if (!form.license_number.trim()) errs.license_number = 'License number is required.';
    if (form.experience_years === '' || Number(form.experience_years) < 0) errs.experience_years = 'Experience must be 0 or more.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { ...form, experience_years: Number(form.experience_years) };
      if (isEdit) {
        await updatePilot(pilot.id, payload);
        toast.success('Pilot updated successfully');
      } else {
        await createPilot(payload);
        toast.success('Pilot added successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to save pilot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={isEdit ? 'Edit Pilot' : 'Add Pilot'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full Name" id="name" value={form.name} onChange={(e) => handleChange('name', e.target.value)} error={errors.name} placeholder="Captain John Doe" required />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Email" id="email" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} error={errors.email} required />
          <Input label="Phone" id="phone" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="+91-9876543210" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="License Number" id="license_number" value={form.license_number} onChange={(e) => handleChange('license_number', e.target.value)} error={errors.license_number} placeholder="DGCA-CPL-2020-001" required />
          <Input label="Experience (years)" id="experience_years" type="number" value={form.experience_years} onChange={(e) => handleChange('experience_years', e.target.value)} error={errors.experience_years} required />
        </div>
        <Select label="Status" id="status" value={form.status} onChange={(e) => handleChange('status', e.target.value)} options={[
          { value: 'available', label: 'Available' },
          { value: 'assigned', label: 'Assigned' },
          { value: 'on_leave', label: 'On Leave' },
          { value: 'unavailable', label: 'Unavailable' },
        ]} />
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>{isEdit ? 'Update' : 'Add'} Pilot</Button>
        </div>
      </form>
    </Modal>
  );
}
