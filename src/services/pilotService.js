import { getTable, insertRecord, updateRecord, deleteRecord } from '../lib/localDb';

export const getPilots = async ({ search = '', status = '' } = {}) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  let data = getTable('pilots');

  if (search) {
    const s = search.toLowerCase();
    data = data.filter(p => 
      p.name.toLowerCase().includes(s) || 
      p.email.toLowerCase().includes(s) || 
      p.license_number.toLowerCase().includes(s)
    );
  }

  if (status) {
    data = data.filter(p => p.status === status);
  }

  return data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

export const getAvailablePilots = async () => {
  return getTable('pilots').filter(p => p.status === 'available');
};

export const createPilot = async (pilotData) => {
  return insertRecord('pilots', pilotData);
};

export const updatePilot = async (id, updates) => {
  return updateRecord('pilots', id, updates);
};

export const deletePilot = async (id) => {
  deleteRecord('pilots', id);
};

export const getPilotStats = async () => {
  const data = getTable('pilots');
  return {
    total: data.length,
    available: data.filter(p => p.status === 'available').length,
    assigned: data.filter(p => p.status === 'assigned').length,
    on_leave: data.filter(p => p.status === 'on_leave').length,
  };
};
