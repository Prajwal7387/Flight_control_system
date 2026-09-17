import { getTable, insertRecord, updateRecord, deleteRecord } from '../lib/localDb';

export const getAircraft = async ({ search = '', status = '' } = {}) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  let data = getTable('aircraft');

  if (search) {
    const s = search.toLowerCase();
    data = data.filter(a => 
      a.registration_number.toLowerCase().includes(s) || 
      a.model.toLowerCase().includes(s) || 
      a.manufacturer.toLowerCase().includes(s)
    );
  }

  if (status) {
    data = data.filter(a => a.status === status);
  }

  return data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

export const getAvailableAircraft = async () => {
  return getTable('aircraft').filter(a => a.status === 'available');
};

export const createAircraft = async (aircraftData) => {
  return insertRecord('aircraft', aircraftData);
};

export const updateAircraft = async (id, updates) => {
  return updateRecord('aircraft', id, updates);
};

export const deleteAircraft = async (id) => {
  deleteRecord('aircraft', id);
};

export const getAircraftStats = async () => {
  const data = getTable('aircraft');
  return {
    total: data.length,
    available: data.filter(a => a.status === 'available').length,
    maintenance: data.filter(a => a.status === 'maintenance').length,
    assigned: data.filter(a => a.status === 'assigned').length,
  };
};
