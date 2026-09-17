import { supabase } from '../lib/supabase';

// ============================================================
// PILOT SERVICE - CRUD operations for pilot management
// ============================================================

export async function getPilots({ search = '', status = '' } = {}) {
  let query = supabase.from('pilots').select('*').order('name');

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,license_number.ilike.%${search}%`);
  }
  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getPilotById(id) {
  const { data, error } = await supabase
    .from('pilots')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createPilot(pilot) {
  const { data, error } = await supabase
    .from('pilots')
    .insert([pilot])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePilot(id, updates) {
  const { data, error } = await supabase
    .from('pilots')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePilot(id) {
  const { error } = await supabase.from('pilots').delete().eq('id', id);
  if (error) throw error;
}

export async function getAvailablePilots() {
  const { data, error } = await supabase
    .from('pilots')
    .select('*')
    .eq('status', 'available')
    .order('name');
  if (error) throw error;
  return data;
}

export async function getPilotStats() {
  const { data, error } = await supabase.from('pilots').select('status');
  if (error) throw error;

  const stats = { total: data.length, available: 0, assigned: 0, on_leave: 0, unavailable: 0 };
  data.forEach((p) => { stats[p.status] = (stats[p.status] || 0) + 1; });
  return stats;
}
