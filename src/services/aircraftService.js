import { supabase } from '../lib/supabase';

// ============================================================
// AIRCRAFT SERVICE - CRUD operations for aircraft management
// ============================================================

/**
 * Fetch all aircraft with optional search and status filter
 */
export async function getAircraft({ search = '', status = '' } = {}) {
  let query = supabase.from('aircraft').select('*').order('created_at', { ascending: false });

  if (search) {
    query = query.or(`registration_number.ilike.%${search}%,model.ilike.%${search}%,manufacturer.ilike.%${search}%`);
  }
  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Get a single aircraft by ID
 */
export async function getAircraftById(id) {
  const { data, error } = await supabase
    .from('aircraft')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Create a new aircraft
 */
export async function createAircraft(aircraft) {
  const { data, error } = await supabase
    .from('aircraft')
    .insert([aircraft])
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Update an existing aircraft
 */
export async function updateAircraft(id, updates) {
  const { data, error } = await supabase
    .from('aircraft')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Delete an aircraft
 */
export async function deleteAircraft(id) {
  const { error } = await supabase
    .from('aircraft')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

/**
 * Get available aircraft (for flight scheduling)
 */
export async function getAvailableAircraft() {
  const { data, error } = await supabase
    .from('aircraft')
    .select('*')
    .eq('status', 'available')
    .order('registration_number');
  if (error) throw error;
  return data;
}

/**
 * Get aircraft count by status (for dashboard)
 */
export async function getAircraftStats() {
  const { data, error } = await supabase.from('aircraft').select('status');
  if (error) throw error;
  
  const stats = { total: data.length, available: 0, assigned: 0, maintenance: 0, unavailable: 0 };
  data.forEach((a) => { stats[a.status] = (stats[a.status] || 0) + 1; });
  return stats;
}
