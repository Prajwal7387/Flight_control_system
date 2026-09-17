import { supabase } from '../lib/supabase';

// ============================================================
// ROUTE SERVICE - CRUD operations for route management
// ============================================================

export async function getRoutes({ search = '' } = {}) {
  let query = supabase.from('routes').select('*').order('route_name');

  if (search) {
    query = query.or(`route_name.ilike.%${search}%,source.ilike.%${search}%,destination.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getRouteById(id) {
  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createRoute(route) {
  const { data, error } = await supabase
    .from('routes')
    .insert([route])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateRoute(id, updates) {
  const { data, error } = await supabase
    .from('routes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteRoute(id) {
  const { error } = await supabase.from('routes').delete().eq('id', id);
  if (error) throw error;
}

export async function getAllRoutes() {
  const { data, error } = await supabase.from('routes').select('*').order('route_name');
  if (error) throw error;
  return data;
}
