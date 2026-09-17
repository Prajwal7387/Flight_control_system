import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { createFlight, updateFlight } from '../../services/flightService';
import { getAvailableAircraft } from '../../services/aircraftService';
import { getAvailablePilots } from '../../services/pilotService';
import { getAllRoutes } from '../../services/routeService';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

export default function FlightFormModal({ flight, onClose, onSuccess }) {
  const { profile } = useAuth();
  const toast = useToast();
  const isEdit = !!flight;

  const [form, setForm] = useState({
    flight_number: flight?.flight_number || '',
    source: flight?.source || '',
    destination: flight?.destination || '',
    route_id: flight?.route_id || '',
    aircraft_id: flight?.aircraft_id || '',
    pilot_id: flight?.pilot_id || '',
    departure_date: flight?.departure_date || '',
    departure_time: flight?.departure_time || '',
    arrival_date: flight?.arrival_date || '',
    arrival_time: flight?.arrival_time || '',
    status: flight?.status || 'scheduled',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [aircraftList, setAircraftList] = useState([]);
  const [pilotList, setPilotList] = useState([]);
  const [routeList, setRouteList] = useState([]);

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const [ac, pl, rt] = await Promise.all([
        getAvailableAircraft(),
        getAvailablePilots(),
        getAllRoutes(),
      ]);
      setAircraftList(ac);
      setPilotList(pl);
      setRouteList(rt);
    } catch (error) {
      toast.error('Failed to load options');
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));

    // Auto-fill source/destination when route is selected
    if (field === 'route_id' && value) {
      const route = routeList.find((r) => r.id === value);
      if (route) {
        setForm((prev) => ({ ...prev, route_id: value, source: route.source, destination: route.destination }));
      }
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.flight_number.trim()) errs.flight_number = 'Flight number is required.';
    if (!form.source.trim()) errs.source = 'Source is required.';
    if (!form.destination.trim()) errs.destination = 'Destination is required.';
    if (!form.departure_date) errs.departure_date = 'Departure date is required.';
    if (!form.departure_time) errs.departure_time = 'Departure time is required.';
    if (!form.arrival_date) errs.arrival_date = 'Arrival date is required.';
    if (!form.arrival_time) errs.arrival_time = 'Arrival time is required.';

    // Validate arrival is after departure
    if (form.departure_date && form.departure_time && form.arrival_date && form.arrival_time) {
      const dep = new Date(`${form.departure_date}T${form.departure_time}`);
      const arr = new Date(`${form.arrival_date}T${form.arrival_time}`);
      if (arr <= dep) errs.arrival_time = 'Arrival must be after departure.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        ...form,
        route_id: form.route_id || null,
        aircraft_id: form.aircraft_id || null,
        pilot_id: form.pilot_id || null,
        created_by: profile?.id,
      };

      if (isEdit) {
        await updateFlight(flight.id, payload);
        toast.success('Flight updated successfully');
      } else {
        await createFlight(payload);
        toast.success('Flight scheduled successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to save flight');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={isEdit ? 'Edit Flight' : 'Schedule New Flight'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Flight Number" id="flight_number" value={form.flight_number} onChange={(e) => handleChange('flight_number', e.target.value)} error={errors.flight_number} placeholder="FC107" required disabled={isEdit} />

        <Select
          label="Route (optional — auto-fills source/destination)"
          id="route_id"
          value={form.route_id}
          onChange={(e) => handleChange('route_id', e.target.value)}
          placeholder="Select a route..."
          options={routeList.map((r) => ({ value: r.id, label: `${r.route_name} (${r.source} → ${r.destination})` }))}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Source" id="source" value={form.source} onChange={(e) => handleChange('source', e.target.value)} error={errors.source} placeholder="Mumbai (BOM)" required />
          <Input label="Destination" id="destination" value={form.destination} onChange={(e) => handleChange('destination', e.target.value)} error={errors.destination} placeholder="Delhi (DEL)" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Aircraft"
            id="aircraft_id"
            value={form.aircraft_id}
            onChange={(e) => handleChange('aircraft_id', e.target.value)}
            placeholder="Select aircraft..."
            options={aircraftList.map((a) => ({ value: a.id, label: `${a.registration_number} (${a.model})` }))}
          />
          <Select
            label="Pilot"
            id="pilot_id"
            value={form.pilot_id}
            onChange={(e) => handleChange('pilot_id', e.target.value)}
            placeholder="Select pilot..."
            options={pilotList.map((p) => ({ value: p.id, label: `${p.name} (${p.license_number})` }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Departure Date" id="departure_date" type="date" value={form.departure_date} onChange={(e) => handleChange('departure_date', e.target.value)} error={errors.departure_date} required />
          <Input label="Departure Time" id="departure_time" type="time" value={form.departure_time} onChange={(e) => handleChange('departure_time', e.target.value)} error={errors.departure_time} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Arrival Date" id="arrival_date" type="date" value={form.arrival_date} onChange={(e) => handleChange('arrival_date', e.target.value)} error={errors.arrival_date} required />
          <Input label="Arrival Time" id="arrival_time" type="time" value={form.arrival_time} onChange={(e) => handleChange('arrival_time', e.target.value)} error={errors.arrival_time} required />
        </div>

        {isEdit && (
          <Select label="Status" id="status" value={form.status} onChange={(e) => handleChange('status', e.target.value)} options={[
            { value: 'scheduled', label: 'Scheduled' },
            { value: 'boarding', label: 'Boarding' },
            { value: 'ready', label: 'Ready' },
            { value: 'in_flight', label: 'In Flight' },
            { value: 'delayed', label: 'Delayed' },
            { value: 'landed', label: 'Landed' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' },
          ]} />
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>{isEdit ? 'Update' : 'Schedule'} Flight</Button>
        </div>
      </form>
    </Modal>
  );
}
