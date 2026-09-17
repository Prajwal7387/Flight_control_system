import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Plane,
  Users,
  Navigation,
  CalendarClock,
  Radio,
  AlertTriangle,
  Bell,
  FileBarChart,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronLeft,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'operator', 'pilot'] },
  { path: '/flights', label: 'Flights', icon: Plane, roles: ['admin', 'operator', 'pilot'] },
  { path: '/flight-monitor', label: 'Flight Monitor', icon: Radio, roles: ['admin', 'operator'] },
  { path: '/aircraft', label: 'Aircraft', icon: Plane, roles: ['admin', 'operator', 'pilot'] },
  { path: '/pilots', label: 'Pilots', icon: Users, roles: ['admin', 'operator'] },
  { path: '/routes', label: 'Routes', icon: Navigation, roles: ['admin', 'operator', 'pilot'] },
  { path: '/emergencies', label: 'Emergencies', icon: AlertTriangle, roles: ['admin', 'operator', 'pilot'] },
  { path: '/alerts', label: 'Alerts', icon: Bell, roles: ['admin', 'operator', 'pilot'] },
  { path: '/reports', label: 'Reports', icon: FileBarChart, roles: ['admin', 'operator'] },
  { path: '/users', label: 'User Management', icon: Shield, roles: ['admin'] },
];

export default function DashboardLayout() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const filteredNav = navItems.filter((item) =>
    item.roles.includes(profile?.role)
  );

  const roleLabel = {
    admin: 'Administrator',
    operator: 'Flight Operator',
    pilot: 'Pilot',
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'w-[68px]' : 'w-64'}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-gray-100 flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-navy-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <Plane size={18} className="text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-gray-900 truncate">Flight Control</h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">System</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {filteredNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : 'text-gray-600'}`
                }
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={18} className="flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User info */}
        <div className="border-t border-gray-100 p-3 flex-shrink-0">
          {!collapsed && (
            <div className="mb-3 px-3">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-500">
                {roleLabel[profile?.role] || profile?.role}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="sidebar-link text-gray-600 hover:text-danger-600 hover:bg-danger-50 w-full"
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center h-8 border-t border-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={16} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <Menu size={20} />
          </button>

          <div className="hidden lg:block">
            <p className="text-sm text-gray-500">
              Welcome back, <span className="font-medium text-gray-900">{profile?.full_name || 'User'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <NavLink
              to="/alerts"
              className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <Bell size={20} />
            </NavLink>
            <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-semibold">
              {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
