import { supabase } from '../lib/supabase';

// ============================================================
// EMERGENCY SERVICE - Emergency reporting and management
// ============================================================

export async function getEmergencies({ search = '', status = '' } = {}) {
  let query = supabase
    .from('emergencies')
    .select(`
      *,
      flight:flight_id (id, flight_number, source, destination, status)
    `)
    .order('reported_at', { ascending: false });

  if (search) {
    query = query.or(`emergency_type.ilike.%${search}%,description.ilike.%${search}%`);
  }
  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getEmergencyById(id) {
  const { data, error } = await supabase
    .from('emergencies')
    .select(`
      *,
      flight:flight_id (id, flight_number, source, destination, status,
        aircraft:aircraft_id(registration_number, model),
        pilot:pilot_id(name)
      )
    `)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Report a new emergency — also updates flight status and creates an alert
 */
export async function createEmergency(emergency) {
  // Create emergency record
  const { data, error } = await supabase
    .from('emergencies')
    .insert([emergency])
    .select()
    .single();
  if (error) throw error;

  // Update flight status to emergency
  if (emergency.flight_id) {
    await supabase
      .from('flights')
      .update({ status: 'emergency' })
      .eq('id', emergency.flight_id);

    // Get flight info for alert message
    const { data: flight } = await supabase
      .from('flights')
      .select('flight_number, source, destination')
      .eq('id', emergency.flight_id)
      .single();

    // Create emergency alert
    await supabase.from('alerts').insert([{
      title: `EMERGENCY: Flight ${flight?.flight_number || 'Unknown'}`,
      message: `${emergency.emergency_type.replace('_', ' ')} emergency reported for flight ${flight?.flight_number} (${flight?.source} → ${flight?.destination}). ${emergency.description}`,
      type: 'emergency',
      flight_id: emergency.flight_id,
    }]);
  }

  return data;
}

export async function updateEmergency(id, updates) {
  const { data, error } = await supabase
    .from('emergencies')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Resolve an emergency — also updates flight status back
 */
export async function resolveEmergency(id) {
  const { data: emergency } = await supabase
    .from('emergencies')
    .select('flight_id')
    .eq('id', id)
    .single();

  const { data, error } = await supabase
    .from('emergencies')
    .update({ status: 'resolved' })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;

  // Update flight status back to delayed (needs manual review)
  if (emergency?.flight_id) {
    await supabase
      .from('flights')
      .update({ status: 'delayed' })
      .eq('id', emergency.flight_id);
  }

  return data;
}

export async function getActiveEmergencies() {
  const { data, error } = await supabase
    .from('emergencies')
    .select(`
      *,
      flight:flight_id (id, flight_number, source, destination)
    `)
    .in('status', ['reported', 'active'])
    .order('reported_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getEmergencyStats() {
  const { data, error } = await supabase.from('emergencies').select('status');
  if (error) throw error;

  const stats = { total: data.length, reported: 0, active: 0, resolved: 0 };
  data.forEach((e) => { stats[e.status] = (stats[e.status] || 0) + 1; });
  return stats;
}
