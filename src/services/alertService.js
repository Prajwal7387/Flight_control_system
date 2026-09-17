import { supabase } from '../lib/supabase';

// ============================================================
// ALERT SERVICE - Alert management and notifications
// ============================================================

export async function getAlerts({ search = '', type = '', isRead = '' } = {}) {
  let query = supabase
    .from('alerts')
    .select(`
      *,
      flight:flight_id (id, flight_number)
    `)
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(`title.ilike.%${search}%,message.ilike.%${search}%`);
  }
  if (type) {
    query = query.eq('type', type);
  }
  if (isRead !== '') {
    query = query.eq('is_read', isRead === 'true');
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createAlert(alert) {
  const { data, error } = await supabase
    .from('alerts')
    .insert([alert])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function markAlertAsRead(id) {
  const { data, error } = await supabase
    .from('alerts')
    .update({ is_read: true })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function markAllAlertsAsRead() {
  const { error } = await supabase
    .from('alerts')
    .update({ is_read: true })
    .eq('is_read', false);
  if (error) throw error;
}

export async function getRecentAlerts(limit = 5) {
  const { data, error } = await supabase
    .from('alerts')
    .select(`
      *,
      flight:flight_id (id, flight_number)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function getUnreadAlertCount() {
  const { count, error } = await supabase
    .from('alerts')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false);
  if (error) throw error;
  return count || 0;
}
