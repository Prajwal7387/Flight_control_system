import { supabase } from '../lib/supabase';

// ============================================================
// REPORT SERVICE - Aggregate data for reports
// ============================================================

/**
 * Flight report: all flights within a date range
 */
export async function getFlightReport({ startDate, endDate } = {}) {
  let query = supabase
    .from('flights')
    .select(`
      *,
      aircraft:aircraft_id (registration_number, model),
      pilot:pilot_id (name, license_number),
      route:route_id (route_name, distance_km)
    `)
    .order('departure_date', { ascending: false });

  if (startDate) query = query.gte('departure_date', startDate);
  if (endDate) query = query.lte('departure_date', endDate);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Aircraft report: all aircraft with usage stats
 */
export async function getAircraftReport() {
  const { data: aircraft, error: aError } = await supabase
    .from('aircraft')
    .select('*')
    .order('registration_number');
  if (aError) throw aError;

  const { data: flights, error: fError } = await supabase
    .from('flights')
    .select('aircraft_id, status');
  if (fError) throw fError;

  // Enrich aircraft with flight counts
  return aircraft.map((a) => {
    const flightList = flights.filter((f) => f.aircraft_id === a.id);
    return {
      ...a,
      total_flights: flightList.length,
      completed_flights: flightList.filter((f) => f.status === 'completed').length,
    };
  });
}

/**
 * Pilot report: all pilots with flight stats
 */
export async function getPilotReport() {
  const { data: pilots, error: pError } = await supabase
    .from('pilots')
    .select('*')
    .order('name');
  if (pError) throw pError;

  const { data: flights, error: fError } = await supabase
    .from('flights')
    .select('pilot_id, status');
  if (fError) throw fError;

  return pilots.map((p) => {
    const flightList = flights.filter((f) => f.pilot_id === p.id);
    return {
      ...p,
      total_flights: flightList.length,
      completed_flights: flightList.filter((f) => f.status === 'completed').length,
    };
  });
}

/**
 * Emergency report
 */
export async function getEmergencyReport({ startDate, endDate } = {}) {
  let query = supabase
    .from('emergencies')
    .select(`
      *,
      flight:flight_id (flight_number, source, destination)
    `)
    .order('reported_at', { ascending: false });

  if (startDate) query = query.gte('reported_at', startDate);
  if (endDate) query = query.lte('reported_at', endDate);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Schedule report: flights grouped by date
 */
export async function getScheduleReport({ startDate, endDate } = {}) {
  let query = supabase
    .from('flights')
    .select(`
      *,
      aircraft:aircraft_id (registration_number),
      pilot:pilot_id (name)
    `)
    .order('departure_date', { ascending: true })
    .order('departure_time', { ascending: true });

  if (startDate) query = query.gte('departure_date', startDate);
  if (endDate) query = query.lte('departure_date', endDate);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
