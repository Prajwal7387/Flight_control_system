-- ============================================================
-- Flight Control System - Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES TABLE
-- Extends Supabase auth.users with role and profile info
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'pilot' CHECK (role IN ('admin', 'operator', 'pilot')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. AIRCRAFT TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS aircraft (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_number TEXT NOT NULL UNIQUE,
  model TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'maintenance', 'unavailable')),
  last_maintenance_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. PILOTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS pilots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  license_number TEXT NOT NULL UNIQUE,
  experience_years INTEGER NOT NULL DEFAULT 0 CHECK (experience_years >= 0),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'on_leave', 'unavailable')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. ROUTES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_name TEXT NOT NULL,
  source TEXT NOT NULL,
  destination TEXT NOT NULL,
  distance_km NUMERIC(10,2) NOT NULL CHECK (distance_km > 0),
  estimated_duration_minutes INTEGER NOT NULL CHECK (estimated_duration_minutes > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 5. FLIGHTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS flights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flight_number TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL,
  destination TEXT NOT NULL,
  route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
  aircraft_id UUID REFERENCES aircraft(id) ON DELETE SET NULL,
  pilot_id UUID REFERENCES pilots(id) ON DELETE SET NULL,
  departure_date DATE NOT NULL,
  departure_time TIME NOT NULL,
  arrival_date DATE NOT NULL,
  arrival_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'boarding', 'ready', 'in_flight', 'delayed', 'landed', 'completed', 'cancelled', 'emergency')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. EMERGENCIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS emergencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
  emergency_type TEXT NOT NULL CHECK (emergency_type IN ('technical', 'medical', 'weather', 'communication', 'other')),
  description TEXT NOT NULL,
  reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'active', 'resolved')),
  reported_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7. ALERTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('delay', 'cancellation', 'status_change', 'emergency', 'assignment', 'info')),
  flight_id UUID REFERENCES flights(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_flights_status ON flights(status);
CREATE INDEX IF NOT EXISTS idx_flights_departure_date ON flights(departure_date);
CREATE INDEX IF NOT EXISTS idx_flights_flight_number ON flights(flight_number);
CREATE INDEX IF NOT EXISTS idx_aircraft_status ON aircraft(status);
CREATE INDEX IF NOT EXISTS idx_pilots_status ON pilots(status);
CREATE INDEX IF NOT EXISTS idx_alerts_user_read ON alerts(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_emergencies_flight ON emergencies(flight_id);
CREATE INDEX IF NOT EXISTS idx_emergencies_status ON emergencies(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============================================================
-- AUTO-UPDATE TIMESTAMPS TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_aircraft_updated_at BEFORE UPDATE ON aircraft FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pilots_updated_at BEFORE UPDATE ON pilots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_flights_updated_at BEFORE UPDATE ON flights FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_emergencies_updated_at BEFORE UPDATE ON emergencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'pilot')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
