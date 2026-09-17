import { getTable, insertRecord, updateRecord, getDb, saveDb } from '../lib/localDb';
import { createAlert } from './alertService';

// Helper to join relations
const populateFlight = (f) => {
  const db = getDb();
  return {
    ...f,
    aircraft: db.aircraft.find(a => a.id === f.aircraft_id) || null,
    pilot: db.pilots.find(p => p.id === f.pilot_id) || null,
    route: db.routes.find(r => r.id === f.route_id) || null,
  };
};

export const getFlights = async ({ search = '', status = '' } = {}) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  let data = getTable('flights');

  if (search) {
    const s = search.toLowerCase();
    data = data.filter(f => 
      f.flight_number.toLowerCase().includes(s) || 
      f.source.toLowerCase().includes(s) || 
      f.destination.toLowerCase().includes(s)
    );
  }

  if (status) {
    data = data.filter(f => f.status === status);
  }

  return data.map(populateFlight).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

export const getActiveFlights = async () => {
  const data = getTable('flights');
  return data
    .filter(f => !['completed', 'cancelled'].includes(f.status))
    .map(populateFlight)
    .sort((a, b) => new Date(a.departure_date) - new Date(b.departure_date));
};

export const getRecentFlights = async (limit = 5) => {
  const data = getTable('flights');
  return data
    .map(populateFlight)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit);
};

export const createFlight = async (flightData) => {
  const flight = insertRecord('flights', flightData);

  // Update resource status to 'assigned'
  if (flightData.aircraft_id) updateRecord('aircraft', flightData.aircraft_id, { status: 'assigned' });
  if (flightData.pilot_id) updateRecord('pilots', flightData.pilot_id, { status: 'assigned' });

  // Create alert
  if (flightData.pilot_id) {
    const pilot = getTable('pilots').find(p => p.id === flightData.pilot_id);
    if (pilot && pilot.profile_id) {
      createAlert({
        title: 'New Flight Assignment',
        message: `You have been assigned to flight ${flight.flight_number}`,
        type: 'assignment',
        flight_id: flight.id,
        user_id: pilot.profile_id
      });
    }
  }

  return flight;
};

export const updateFlight = async (id, updates) => {
  return updateRecord('flights', id, updates);
};

export const updateFlightStatus = async (id, status) => {
  const flights = getTable('flights');
  const flight = flights.find(f => f.id === id);
  if (!flight) throw new Error('Flight not found');

  const updated = updateRecord('flights', id, { status });

  // Free up resources if completed or cancelled
  if (status === 'completed' || status === 'cancelled') {
    if (flight.aircraft_id) updateRecord('aircraft', flight.aircraft_id, { status: 'available' });
    if (flight.pilot_id) updateRecord('pilots', flight.pilot_id, { status: 'available' });
  }

  // Generate alert
  createAlert({
    title: `Flight ${flight.flight_number} Status Update`,
    message: `Status changed to ${status.replace('_', ' ')}`,
    type: status === 'delayed' ? 'delay' : status === 'cancelled' ? 'cancellation' : 'status_change',
    flight_id: flight.id
  });

  return updated;
};

export const getFlightStats = async () => {
  const data = getTable('flights');
  return {
    total: data.length,
    scheduled: data.filter(f => f.status === 'scheduled').length,
    boarding: data.filter(f => f.status === 'boarding').length,
    ready: data.filter(f => f.status === 'ready').length,
    in_flight: data.filter(f => f.status === 'in_flight').length,
    delayed: data.filter(f => f.status === 'delayed').length,
    landed: data.filter(f => f.status === 'landed').length,
    completed: data.filter(f => f.status === 'completed').length,
    cancelled: data.filter(f => f.status === 'cancelled').length,
    emergency: data.filter(f => f.status === 'emergency').length,
  };
};
