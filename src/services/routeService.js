import { getTable, insertRecord, updateRecord, deleteRecord } from '../lib/localDb';

export const getRoutes = async ({ search = '' } = {}) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  let data = getTable('routes');

  if (search) {
    const s = search.toLowerCase();
    data = data.filter(r => 
      r.route_name.toLowerCase().includes(s) || 
      r.source.toLowerCase().includes(s) || 
      r.destination.toLowerCase().includes(s)
    );
  }

  return data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

export const getAllRoutes = async () => {
  return getTable('routes').sort((a, b) => a.route_name.localeCompare(b.route_name));
};

export const createRoute = async (routeData) => {
  return insertRecord('routes', routeData);
};

export const updateRoute = async (id, updates) => {
  return updateRecord('routes', id, updates);
};

export const deleteRoute = async (id) => {
  deleteRecord('routes', id);
};
