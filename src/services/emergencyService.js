import { getTable, insertRecord, updateRecord, getDb } from '../lib/localDb';
import { updateFlightStatus } from './flightService';
import { createAlert } from './alertService';

// Helper
const populateEmergency = (em) => {
  const db = getDb();
  return {
    ...em,
    flight: db.flights.find(f => f.id === em.flight_id) || null
  };
};

export const getEmergencies = async ({ search = '', status = '' } = {}) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  let data = getTable('emergencies');

  if (search) {
    const s = search.toLowerCase();
    data = data.filter(e => 
      e.emergency_type.toLowerCase().includes(s) || 
      e.description.toLowerCase().includes(s)
    );
  }

  if (status) {
    data = data.filter(e => e.status === status);
  }

  return data.map(populateEmergency).sort((a, b) => new Date(b.reported_at) - new Date(a.reported_at));
};

export const getActiveEmergencies = async () => {
  const data = getTable('emergencies');
  return data
    .filter(e => e.status !== 'resolved')
    .map(populateEmergency)
    .sort((a, b) => new Date(b.reported_at) - new Date(a.reported_at));
};

export const createEmergency = async (emergencyData) => {
  const emergency = insertRecord('emergencies', { ...emergencyData, status: 'reported', reported_at: new Date().toISOString() });

  // Update flight status to 'emergency'
  if (emergency.flight_id) {
    await updateFlightStatus(emergency.flight_id, 'emergency');
    
    // Generate critical alert
    const db = getDb();
    const flight = db.flights.find(f => f.id === emergency.flight_id);
    createAlert({
      title: `EMERGENCY on Flight ${flight?.flight_number || 'Unknown'}`,
      message: `Type: ${emergency.emergency_type}. Description: ${emergency.description}`,
      type: 'emergency',
      flight_id: emergency.flight_id
    });
  }

  return emergency;
};

export const resolveEmergency = async (id) => {
  const emergency = updateRecord('emergencies', id, { status: 'resolved' });

  // If the flight is still in emergency status, revert it to delayed
  if (emergency.flight_id) {
    const flight = getTable('flights').find(f => f.id === emergency.flight_id);
    if (flight && flight.status === 'emergency') {
      await updateFlightStatus(flight.id, 'delayed');
    }
  }

  return emergency;
};
