-- ============================================================
-- Flight Control System - Seed / Demo Data
-- Run AFTER schema and RLS policies are created
-- NOTE: User accounts must be created via Supabase Auth first.
--       Then update the profile IDs below to match.
-- ============================================================

-- ============================================================
-- AIRCRAFT (6 aircraft)
-- ============================================================
INSERT INTO aircraft (id, registration_number, model, manufacturer, capacity, status, last_maintenance_date) VALUES
  (uuid_generate_v4(), 'VT-ANA', 'Boeing 737-800', 'Boeing', 189, 'available', '2026-08-15'),
  (uuid_generate_v4(), 'VT-ANB', 'Airbus A320neo', 'Airbus', 180, 'available', '2026-07-20'),
  (uuid_generate_v4(), 'VT-ANC', 'Boeing 777-300ER', 'Boeing', 342, 'maintenance', '2026-09-01'),
  (uuid_generate_v4(), 'VT-AND', 'Airbus A321neo', 'Airbus', 220, 'available', '2026-08-10'),
  (uuid_generate_v4(), 'VT-ANE', 'ATR 72-600', 'ATR', 72, 'available', '2026-06-25'),
  (uuid_generate_v4(), 'VT-ANF', 'Embraer E190-E2', 'Embraer', 114, 'unavailable', '2026-05-15');

-- ============================================================
-- PILOTS (5 pilots - profile_id will be NULL until linked)
-- ============================================================
INSERT INTO pilots (id, name, email, phone, license_number, experience_years, status) VALUES
  (uuid_generate_v4(), 'Captain Rajesh Kumar', 'rajesh.kumar@fcs.in', '+91-9876543210', 'DGCA-CPL-2015-001', 11, 'available'),
  (uuid_generate_v4(), 'Captain Priya Sharma', 'priya.sharma@fcs.in', '+91-9876543211', 'DGCA-CPL-2016-042', 10, 'available'),
  (uuid_generate_v4(), 'Captain Arjun Patel', 'arjun.patel@fcs.in', '+91-9876543212', 'DGCA-CPL-2018-073', 8, 'on_leave'),
  (uuid_generate_v4(), 'Captain Sneha Reddy', 'sneha.reddy@fcs.in', '+91-9876543213', 'DGCA-CPL-2017-055', 9, 'available'),
  (uuid_generate_v4(), 'Captain Vikram Singh', 'vikram.singh@fcs.in', '+91-9876543214', 'DGCA-CPL-2019-091', 7, 'available');

-- ============================================================
-- ROUTES (8 routes)
-- ============================================================
INSERT INTO routes (id, route_name, source, destination, distance_km, estimated_duration_minutes) VALUES
  (uuid_generate_v4(), 'Mumbai-Delhi Express', 'Mumbai (BOM)', 'Delhi (DEL)', 1148, 130),
  (uuid_generate_v4(), 'Delhi-Bengaluru Link', 'Delhi (DEL)', 'Bengaluru (BLR)', 1740, 165),
  (uuid_generate_v4(), 'Ahmedabad-Mumbai Shuttle', 'Ahmedabad (AMD)', 'Mumbai (BOM)', 524, 75),
  (uuid_generate_v4(), 'Chennai-Kolkata Route', 'Chennai (MAA)', 'Kolkata (CCU)', 1366, 150),
  (uuid_generate_v4(), 'Hyderabad-Delhi Route', 'Hyderabad (HYD)', 'Delhi (DEL)', 1260, 140),
  (uuid_generate_v4(), 'Mumbai-Goa Coastal', 'Mumbai (BOM)', 'Goa (GOI)', 450, 65),
  (uuid_generate_v4(), 'Delhi-Jaipur Shuttle', 'Delhi (DEL)', 'Jaipur (JAI)', 268, 50),
  (uuid_generate_v4(), 'Bengaluru-Chennai Express', 'Bengaluru (BLR)', 'Chennai (MAA)', 290, 55);

-- ============================================================
-- FLIGHTS (6 sample flights)
-- NOTE: These reference aircraft and pilots by selecting from the inserted data.
-- Run these after confirming the above inserts succeeded.
-- ============================================================
INSERT INTO flights (id, flight_number, source, destination, route_id, aircraft_id, pilot_id, departure_date, departure_time, arrival_date, arrival_time, status) VALUES
  (
    uuid_generate_v4(), 'FC101', 'Mumbai (BOM)', 'Delhi (DEL)',
    (SELECT id FROM routes WHERE route_name = 'Mumbai-Delhi Express' LIMIT 1),
    (SELECT id FROM aircraft WHERE registration_number = 'VT-ANA' LIMIT 1),
    (SELECT id FROM pilots WHERE license_number = 'DGCA-CPL-2015-001' LIMIT 1),
    '2026-09-18', '06:00', '2026-09-18', '08:10', 'scheduled'
  ),
  (
    uuid_generate_v4(), 'FC102', 'Delhi (DEL)', 'Bengaluru (BLR)',
    (SELECT id FROM routes WHERE route_name = 'Delhi-Bengaluru Link' LIMIT 1),
    (SELECT id FROM aircraft WHERE registration_number = 'VT-ANB' LIMIT 1),
    (SELECT id FROM pilots WHERE license_number = 'DGCA-CPL-2016-042' LIMIT 1),
    '2026-09-18', '09:30', '2026-09-18', '12:15', 'scheduled'
  ),
  (
    uuid_generate_v4(), 'FC103', 'Ahmedabad (AMD)', 'Mumbai (BOM)',
    (SELECT id FROM routes WHERE route_name = 'Ahmedabad-Mumbai Shuttle' LIMIT 1),
    (SELECT id FROM aircraft WHERE registration_number = 'VT-AND' LIMIT 1),
    (SELECT id FROM pilots WHERE license_number = 'DGCA-CPL-2017-055' LIMIT 1),
    '2026-09-17', '14:00', '2026-09-17', '15:15', 'in_flight'
  ),
  (
    uuid_generate_v4(), 'FC104', 'Chennai (MAA)', 'Kolkata (CCU)',
    (SELECT id FROM routes WHERE route_name = 'Chennai-Kolkata Route' LIMIT 1),
    (SELECT id FROM aircraft WHERE registration_number = 'VT-ANE' LIMIT 1),
    (SELECT id FROM pilots WHERE license_number = 'DGCA-CPL-2019-091' LIMIT 1),
    '2026-09-17', '07:00', '2026-09-17', '09:30', 'completed'
  ),
  (
    uuid_generate_v4(), 'FC105', 'Mumbai (BOM)', 'Goa (GOI)',
    (SELECT id FROM routes WHERE route_name = 'Mumbai-Goa Coastal' LIMIT 1),
    (SELECT id FROM aircraft WHERE registration_number = 'VT-ANA' LIMIT 1),
    (SELECT id FROM pilots WHERE license_number = 'DGCA-CPL-2015-001' LIMIT 1),
    '2026-09-19', '16:00', '2026-09-19', '17:05', 'scheduled'
  ),
  (
    uuid_generate_v4(), 'FC106', 'Delhi (DEL)', 'Jaipur (JAI)',
    (SELECT id FROM routes WHERE route_name = 'Delhi-Jaipur Shuttle' LIMIT 1),
    (SELECT id FROM aircraft WHERE registration_number = 'VT-ANB' LIMIT 1),
    (SELECT id FROM pilots WHERE license_number = 'DGCA-CPL-2016-042' LIMIT 1),
    '2026-09-17', '11:00', '2026-09-17', '11:50', 'delayed'
  );

-- ============================================================
-- ALERTS (sample alerts)
-- ============================================================
INSERT INTO alerts (title, message, type, flight_id, is_read) VALUES
  ('Flight FC106 Delayed', 'Flight FC106 Delhi to Jaipur has been delayed due to weather conditions.', 'delay',
    (SELECT id FROM flights WHERE flight_number = 'FC106' LIMIT 1), false),
  ('Flight FC104 Completed', 'Flight FC104 Chennai to Kolkata has landed successfully.', 'status_change',
    (SELECT id FROM flights WHERE flight_number = 'FC104' LIMIT 1), true),
  ('Aircraft VT-ANC Under Maintenance', 'Aircraft VT-ANC (Boeing 777-300ER) is currently under scheduled maintenance.', 'info', NULL, false);
