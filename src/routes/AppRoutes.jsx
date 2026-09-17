import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// Layouts
import DashboardLayout from '../layouts/DashboardLayout';

// Auth pages
import LoginPage from '../pages/auth/LoginPage';
import UnauthorizedPage from '../pages/auth/UnauthorizedPage';

// Feature pages
import DashboardPage from '../pages/dashboard/DashboardPage';
import AircraftListPage from '../pages/aircraft/AircraftListPage';
import PilotListPage from '../pages/pilots/PilotListPage';
import RouteListPage from '../pages/routes/RouteListPage';
import FlightListPage from '../pages/flights/FlightListPage';
import FlightMonitorPage from '../pages/flights/FlightMonitorPage';
import EmergencyListPage from '../pages/emergencies/EmergencyListPage';
import AlertsPage from '../pages/alerts/AlertsPage';
import ReportsPage from '../pages/reports/ReportsPage';
import UserManagementPage from '../pages/users/UserManagementPage';

/**
 * ProtectedRoute — redirects to /login if not authenticated
 */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner message="Checking authentication..." />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

/**
 * RoleGuard — shows Unauthorized if user doesn't have required role
 */
function RoleGuard({ roles, children }) {
  const { profile, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!profile || !roles.includes(profile.role)) {
    return <UnauthorizedPage />;
  }
  return children;
}

export default function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading..." />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />

      {/* Protected routes inside DashboardLayout */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/aircraft" element={<AircraftListPage />} />

        <Route
          path="/pilots"
          element={
            <RoleGuard roles={['admin', 'operator']}>
              <PilotListPage />
            </RoleGuard>
          }
        />

        <Route path="/routes" element={<RouteListPage />} />

        <Route path="/flights" element={<FlightListPage />} />

        <Route
          path="/flight-monitor"
          element={
            <RoleGuard roles={['admin', 'operator']}>
              <FlightMonitorPage />
            </RoleGuard>
          }
        />

        <Route path="/emergencies" element={<EmergencyListPage />} />

        <Route path="/alerts" element={<AlertsPage />} />

        <Route
          path="/reports"
          element={
            <RoleGuard roles={['admin', 'operator']}>
              <ReportsPage />
            </RoleGuard>
          }
        />

        <Route
          path="/users"
          element={
            <RoleGuard roles={['admin']}>
              <UserManagementPage />
            </RoleGuard>
          }
        />

        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}
