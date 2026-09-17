import { getTable, getDb } from '../lib/localDb';

// Helpers to join relations for reports
const populateFlightForReport = (f, db) => ({
  ...f,
  aircraft: db.aircraft.find(a => a.id === f.aircraft_id) || null,
  pilot: db.pilots.find(p => p.id === f.pilot_id) || null,
});

const isDateInRange = (dateStr, startDate, endDate) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const start = startDate ? new Date(startDate) : new Date(0);
  const end = endDate ? new Date(endDate) : new Date(8640000000000000);
  // Set end date to end of day
  end.setHours(23, 59, 59, 999);
  return d >= start && d <= end;
};

export const getFlightReport = async ({ startDate, endDate } = {}) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const db = getDb();
  let flights = db.flights;

  if (startDate || endDate) {
    flights = flights.filter(f => isDateInRange(f.departure_date, startDate, endDate));
  }
  
  return flights.map(f => populateFlightForReport(f, db));
};

export const getAircraftReport = async () => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const db = getDb();
  const aircraft = db.aircraft;
  
  return aircraft.map(a => {
    const flightsForAircraft = db.flights.filter(f => f.aircraft_id === a.id);
    return {
      ...a,
      total_flights: flightsForAircraft.length,
      completed_flights: flightsForAircraft.filter(f => f.status === 'completed').length
    };
  });
};

export const getPilotReport = async () => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const db = getDb();
  const pilots = db.pilots;
  
  return pilots.map(p => {
    const flightsForPilot = db.flights.filter(f => f.pilot_id === p.id);
    return {
      ...p,
      total_flights: flightsForPilot.length,
      completed_flights: flightsForPilot.filter(f => f.status === 'completed').length
    };
  });
};

export const getEmergencyReport = async ({ startDate, endDate } = {}) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const db = getDb();
  let emergencies = db.emergencies;

  if (startDate || endDate) {
    emergencies = emergencies.filter(e => isDateInRange(e.reported_at, startDate, endDate));
  }

  return emergencies.map(e => ({
    ...e,
    flight: db.flights.find(f => f.id === e.flight_id) || null
  }));
};

export const getScheduleReport = async ({ startDate, endDate } = {}) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const db = getDb();
  let flights = db.flights.filter(f => ['scheduled', 'delayed'].includes(f.status));

  if (startDate || endDate) {
    flights = flights.filter(f => isDateInRange(f.departure_date, startDate, endDate));
  }

  return flights.map(f => populateFlightForReport(f, db)).sort((a, b) => new Date(a.departure_date) - new Date(b.departure_date));
};
