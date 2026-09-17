import { getTable, insertRecord, updateRecord, getDb } from '../lib/localDb';

// Helper
const populateAlert = (alert) => {
  const db = getDb();
  return {
    ...alert,
    flight: alert.flight_id ? db.flights.find(f => f.id === alert.flight_id) : null
  };
};

export const getAlerts = async ({ search = '', type = '', isRead = '' } = {}) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  let data = getTable('alerts');

  // If there's an active user context, we could filter by user_id, 
  // but for demo purposes we'll just show all alerts to everyone, or filter if user_id is provided in actual use.
  const activeUser = localStorage.getItem('fcs_active_user_id');
  if (activeUser) {
    const userProfile = getTable('profiles').find(p => p.id === activeUser);
    if (userProfile && userProfile.role === 'pilot') {
      // Pilots only see their alerts
      data = data.filter(a => a.user_id === activeUser || !a.user_id);
    }
  }

  if (search) {
    const s = search.toLowerCase();
    data = data.filter(a => a.title.toLowerCase().includes(s) || a.message.toLowerCase().includes(s));
  }
  if (type) {
    data = data.filter(a => a.type === type);
  }
  if (isRead !== '') {
    const readBool = isRead === 'true' || isRead === true;
    data = data.filter(a => a.is_read === readBool);
  }

  return data.map(populateAlert).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

export const getRecentAlerts = async (limit = 5) => {
  let data = getTable('alerts');
  return data
    .map(populateAlert)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit);
};

export const createAlert = async (alertData) => {
  return insertRecord('alerts', { ...alertData, is_read: false });
};

export const markAlertAsRead = async (id) => {
  return updateRecord('alerts', id, { is_read: true });
};

export const markAllAlertsAsRead = async () => {
  const alerts = getTable('alerts');
  alerts.forEach(a => {
    if (!a.is_read) updateRecord('alerts', a.id, { is_read: true });
  });
};
