/**
 * localDb.js - A LocalStorage wrapper to simulate a database for the Flight Control System
 */

// Generate UUID for mock data
export const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const DB_KEY = 'fcs_db';

const initialData = {
  profiles: [
    { id: 'admin-1', full_name: 'Admin User', email: 'admin@fcs.in', role: 'admin', created_at: new Date().toISOString() },
    { id: 'operator-1', full_name: 'Flight Operator', email: 'operator@fcs.in', role: 'operator', created_at: new Date().toISOString() },
    { id: 'pilot-1', full_name: 'Captain Rajesh Kumar', email: 'rajesh.kumar@fcs.in', role: 'pilot', created_at: new Date().toISOString() },
  ],
  aircraft: [
    { id: generateId(), registration_number: 'VT-ANA', model: 'Boeing 737-800', manufacturer: 'Boeing', capacity: 189, status: 'available', last_maintenance_date: '2026-08-15', created_at: new Date().toISOString() },
    { id: generateId(), registration_number: 'VT-ANB', model: 'Airbus A320neo', manufacturer: 'Airbus', capacity: 180, status: 'available', last_maintenance_date: '2026-07-20', created_at: new Date().toISOString() },
    { id: generateId(), registration_number: 'VT-ANC', model: 'Boeing 777-300ER', manufacturer: 'Boeing', capacity: 342, status: 'maintenance', last_maintenance_date: '2026-09-01', created_at: new Date().toISOString() },
  ],
  pilots: [
    { id: generateId(), profile_id: 'pilot-1', name: 'Captain Rajesh Kumar', email: 'rajesh.kumar@fcs.in', phone: '+91-9876543210', license_number: 'DGCA-CPL-2015-001', experience_years: 11, status: 'available', created_at: new Date().toISOString() },
    { id: generateId(), profile_id: null, name: 'Captain Priya Sharma', email: 'priya.sharma@fcs.in', phone: '+91-9876543211', license_number: 'DGCA-CPL-2016-042', experience_years: 10, status: 'available', created_at: new Date().toISOString() },
  ],
  routes: [
    { id: generateId(), route_name: 'Mumbai-Delhi Express', source: 'Mumbai (BOM)', destination: 'Delhi (DEL)', distance_km: 1148, estimated_duration_minutes: 130, created_at: new Date().toISOString() },
    { id: generateId(), route_name: 'Delhi-Bengaluru Link', source: 'Delhi (DEL)', destination: 'Bengaluru (BLR)', distance_km: 1740, estimated_duration_minutes: 165, created_at: new Date().toISOString() },
  ],
  flights: [], // Will be seeded conditionally or left empty for the user to create
  emergencies: [],
  alerts: [
    { id: generateId(), title: 'System Initialized', message: 'Welcome to the Flight Control System mock environment.', type: 'info', is_read: false, created_at: new Date().toISOString() }
  ],
};

// Initialize DB if empty
export const initDb = () => {
  if (!localStorage.getItem(DB_KEY)) {
    localStorage.setItem(DB_KEY, JSON.stringify(initialData));
  }
};

export const getDb = () => {
  initDb();
  return JSON.parse(localStorage.getItem(DB_KEY));
};

export const saveDb = (data) => {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
};

// Generic read
export const getTable = (table) => {
  const db = getDb();
  return db[table] || [];
};

// Generic insert
export const insertRecord = (table, record) => {
  const db = getDb();
  const newRecord = { ...record, id: generateId(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  db[table] = [...(db[table] || []), newRecord];
  saveDb(db);
  return newRecord;
};

// Generic update
export const updateRecord = (table, id, updates) => {
  const db = getDb();
  let updatedRecord = null;
  db[table] = (db[table] || []).map((record) => {
    if (record.id === id) {
      updatedRecord = { ...record, ...updates, updated_at: new Date().toISOString() };
      return updatedRecord;
    }
    return record;
  });
  saveDb(db);
  if (!updatedRecord) throw new Error(`Record with id ${id} not found in ${table}`);
  return updatedRecord;
};

// Generic delete
export const deleteRecord = (table, id) => {
  const db = getDb();
  db[table] = (db[table] || []).filter((record) => record.id !== id);
  saveDb(db);
};
