import { supabase } from '../lib/supabase';

// ============================================================
// FLIGHT SERVICE - CRUD, scheduling, status management
// ============================================================

/**
 * Fetch flights with optional filters. Joins aircraft, pilot, route data.
 */
export async function getFlights({ search = '', status = '' } = {}) {
  let query = supabase
    .from('flights')
    .select(`
      *,
      aircraft:aircraft_id (id, registration_number, model),
      pilot:pilot_id (id, name, license_number),
      route:route_id (id, route_name, distance_km, estimated_duration_minutes)
    `)
    .order('departure_date', { ascending: false });

  if (search) {
    query = query.or(`flight_number.ilike.%${search}%,source.ilike.%${search}%,destination.ilike.%${search}%`);
  }
  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Get a single flight by ID with joined data
 */
export async function getFlightById(id) {
  const { data, error } = await supabase
    .from('flights')
    .select(`
      *,
      aircraft:aircraft_id (id, registration_number, model, manufacturer),
      pilot:pilot_id (id, name, license_number, email),
      route:route_id (id, route_name, source, destination, distance_km, estimated_duration_minutes)
    `)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Create a new flight with scheduling validation
 */
export async function createFlight(flight) {
  // Validate aircraft availability
  if (flight.aircraft_id) {
    const { data: aircraft } = await supabase
      .from('aircraft')
      .select('status')
      .eq('id', flight.aircraft_id)
      .single();
    
    if (aircraft && aircraft.status !== 'available') {
      throw new Error('Selected aircraft is not available for assignment.');
    }
  }

  // Validate pilot availability
  if (flight.pilot_id) {
    const { data: pilot } = await supabase
      .from('pilots')
      .select('status')
      .eq('id', flight.pilot_id)
      .single();
    
    if (pilot && pilot.status !== 'available') {
      throw new Error('Selected pilot is not available for assignment.');
    }
  }

  // Create the flight
  const { data, error } = await supabase
    .from('flights')
    .insert([flight])
    .select()
    .single();
  if (error) throw error;

  // Update aircraft status to assigned
  if (flight.aircraft_id) {
    await supabase.from('aircraft').update({ status: 'assigned' }).eq('id', flight.aircraft_id);
  }

  // Update pilot status to assigned
  if (flight.pilot_id) {
    await supabase.from('pilots').update({ status: 'assigned' }).eq('id', flight.pilot_id);
  }

  // Create assignment alert
  await supabase.from('alerts').insert([{
    title: `Flight ${flight.flight_number} Created`,
    message: `Flight ${flight.flight_number} from ${flight.source} to ${flight.destination} has been scheduled.`,
    type: 'assignment',
    flight_id: data.id,
  }]);

  return data;
}

/**
 * Update a flight
 */
export async function updateFlight(id, updates) {
  const { data, error } = await supabase
    .from('flights')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Update flight status with cascading effects
 */
export async function updateFlightStatus(id, newStatus) {
  // Get current flight info
  const { data: flight } = await supabase
    .from('flights')
    .select('*, aircraft:aircraft_id(id), pilot:pilot_id(id)')
    .eq('id', id)
    .single();

  if (!flight) throw new Error('Flight not found');

  // Update flight status
  const { data, error } = await supabase
    .from('flights')
    .update({ status: newStatus })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;

  // If flight is completed, cancelled, or landed — release aircraft and pilot
  if (['completed', 'cancelled', 'landed'].includes(newStatus)) {
    if (flight.aircraft_id) {
      await supabase.from('aircraft').update({ status: 'available' }).eq('id', flight.aircraft_id);
    }
    if (flight.pilot_id) {
      await supabase.from('pilots').update({ status: 'available' }).eq('id', flight.pilot_id);
    }
  }

  // Create status change alert
  await supabase.from('alerts').insert([{
    title: `Flight ${flight.flight_number} Status Update`,
    message: `Flight ${flight.flight_number} status changed to ${newStatus.replace('_', ' ')}.`,
    type: newStatus === 'delayed' ? 'delay' : newStatus === 'cancelled' ? 'cancellation' : 'status_change',
    flight_id: id,
  }]);

  return data;
}

/**
 * Delete/cancel a flight
 */
export async function deleteFlight(id) {
  await updateFlightStatus(id, 'cancelled');
}

/**
 * Get flight statistics for dashboard
 */
export async function getFlightStats() {
  const { data, error } = await supabase.from('flights').select('status');
  if (error) throw error;

  const stats = {
    total: data.length,
    scheduled: 0,
    boarding: 0,
    ready: 0,
    in_flight: 0,
    delayed: 0,
    landed: 0,
    completed: 0,
    cancelled: 0,
    emergency: 0,
  };
  data.forEach((f) => { stats[f.status] = (stats[f.status] || 0) + 1; });
  return stats;
}

/**
 * Get recent flights for dashboard
 */
export async function getRecentFlights(limit = 5) {
  const { data, error } = await supabase
    .from('flights')
    .select(`
      *,
      aircraft:aircraft_id (registration_number, model),
      pilot:pilot_id (name)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

/**
 * Get active flights for monitoring
 */
export async function getActiveFlights() {
  const { data, error } = await supabase
    .from('flights')
    .select(`
      *,
      aircraft:aircraft_id (id, registration_number, model),
      pilot:pilot_id (id, name, license_number),
      route:route_id (id, route_name)
    `)
    .in('status', ['scheduled', 'boarding', 'ready', 'in_flight', 'delayed', 'emergency'])
    .order('departure_date', { ascending: true });
  if (error) throw error;
  return data;
}
