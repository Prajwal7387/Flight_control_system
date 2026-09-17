-- ============================================================
-- Flight Control System - Row Level Security Policies
-- Run this AFTER 001_schema.sql in Supabase SQL Editor
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE aircraft ENABLE ROW LEVEL SECURITY;
ALTER TABLE pilots ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTION: Get current user's role
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- PROFILES POLICIES
-- ============================================================
-- Admin: full access
CREATE POLICY "Admin full access to profiles"
  ON profiles FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- Operator: read all profiles
CREATE POLICY "Operator read profiles"
  ON profiles FOR SELECT
  USING (get_user_role() = 'operator');

-- Pilot: read own profile
CREATE POLICY "Pilot read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- All authenticated users can update own profile
CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- AIRCRAFT POLICIES
-- ============================================================
-- Admin: full access
CREATE POLICY "Admin full access to aircraft"
  ON aircraft FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- Operator: read and update
CREATE POLICY "Operator read aircraft"
  ON aircraft FOR SELECT
  USING (get_user_role() = 'operator');

CREATE POLICY "Operator update aircraft"
  ON aircraft FOR UPDATE
  USING (get_user_role() = 'operator')
  WITH CHECK (get_user_role() = 'operator');

-- Pilot: read only
CREATE POLICY "Pilot read aircraft"
  ON aircraft FOR SELECT
  USING (get_user_role() = 'pilot');

-- ============================================================
-- PILOTS POLICIES
-- ============================================================
-- Admin: full access
CREATE POLICY "Admin full access to pilots"
  ON pilots FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- Operator: read all pilots
CREATE POLICY "Operator read pilots"
  ON pilots FOR SELECT
  USING (get_user_role() = 'operator');

-- Pilot: read own record
CREATE POLICY "Pilot read own pilot record"
  ON pilots FOR SELECT
  USING (profile_id = auth.uid() OR get_user_role() = 'pilot');

-- ============================================================
-- ROUTES POLICIES
-- ============================================================
-- Admin: read routes
CREATE POLICY "Admin read routes"
  ON routes FOR SELECT
  USING (get_user_role() = 'admin');

-- Operator: full CRUD on routes
CREATE POLICY "Operator full access to routes"
  ON routes FOR ALL
  USING (get_user_role() = 'operator')
  WITH CHECK (get_user_role() = 'operator');

-- Pilot: read routes
CREATE POLICY "Pilot read routes"
  ON routes FOR SELECT
  USING (get_user_role() = 'pilot');

-- ============================================================
-- FLIGHTS POLICIES
-- ============================================================
-- Admin: full access
CREATE POLICY "Admin full access to flights"
  ON flights FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- Operator: full CRUD on flights
CREATE POLICY "Operator full access to flights"
  ON flights FOR ALL
  USING (get_user_role() = 'operator')
  WITH CHECK (get_user_role() = 'operator');

-- Pilot: read assigned flights
CREATE POLICY "Pilot read assigned flights"
  ON flights FOR SELECT
  USING (
    get_user_role() = 'pilot' AND (
      pilot_id IN (SELECT id FROM pilots WHERE profile_id = auth.uid())
      OR get_user_role() = 'pilot'
    )
  );

-- ============================================================
-- EMERGENCIES POLICIES
-- ============================================================
-- Admin: read all emergencies
CREATE POLICY "Admin read emergencies"
  ON emergencies FOR SELECT
  USING (get_user_role() = 'admin');

-- Operator: read and create emergencies
CREATE POLICY "Operator read emergencies"
  ON emergencies FOR SELECT
  USING (get_user_role() = 'operator');

CREATE POLICY "Operator manage emergencies"
  ON emergencies FOR ALL
  USING (get_user_role() = 'operator')
  WITH CHECK (get_user_role() = 'operator');

-- Pilot: create and read emergencies
CREATE POLICY "Pilot create emergencies"
  ON emergencies FOR INSERT
  WITH CHECK (get_user_role() = 'pilot');

CREATE POLICY "Pilot read emergencies"
  ON emergencies FOR SELECT
  USING (get_user_role() = 'pilot');

-- ============================================================
-- ALERTS POLICIES
-- ============================================================
-- Admin: read all alerts
CREATE POLICY "Admin read alerts"
  ON alerts FOR SELECT
  USING (get_user_role() = 'admin');

-- Operator: full access to alerts
CREATE POLICY "Operator full access to alerts"
  ON alerts FOR ALL
  USING (get_user_role() = 'operator')
  WITH CHECK (get_user_role() = 'operator');

-- Pilot: read own alerts and general alerts
CREATE POLICY "Pilot read alerts"
  ON alerts FOR SELECT
  USING (
    get_user_role() = 'pilot' AND (user_id = auth.uid() OR user_id IS NULL)
  );

-- Pilot: update own alerts (mark as read)
CREATE POLICY "Pilot update own alerts"
  ON alerts FOR UPDATE
  USING (get_user_role() = 'pilot' AND (user_id = auth.uid() OR user_id IS NULL))
  WITH CHECK (get_user_role() = 'pilot');
