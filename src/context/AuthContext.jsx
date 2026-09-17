import { createContext, useContext, useState, useEffect } from 'react';
import { getTable, saveDb, getDb } from '../lib/localDb';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for an active session
    const storedUserId = localStorage.getItem('fcs_active_user_id');
    if (storedUserId) {
      const profiles = getTable('profiles');
      const foundProfile = profiles.find((p) => p.id === storedUserId);
      if (foundProfile) {
        setUser({ id: foundProfile.id, email: foundProfile.email });
        setProfile(foundProfile);
      } else {
        localStorage.removeItem('fcs_active_user_id');
      }
    }
    setLoading(false);
  }, []);

  // Mock login: Find user by role or email
  const login = async (role) => {
    const profiles = getTable('profiles');
    let targetProfile = profiles.find((p) => p.role === role);
    
    // Fallback if no profile for role exists
    if (!targetProfile) {
      targetProfile = {
        id: `mock-${role}-${Date.now()}`,
        full_name: `Mock ${role}`,
        email: `mock-${role}@fcs.in`,
        role: role,
        created_at: new Date().toISOString()
      };
      const db = getDb();
      db.profiles.push(targetProfile);
      saveDb(db);
    }

    localStorage.setItem('fcs_active_user_id', targetProfile.id);
    setUser({ id: targetProfile.id, email: targetProfile.email });
    setProfile(targetProfile);
    return targetProfile;
  };

  const logout = async () => {
    localStorage.removeItem('fcs_active_user_id');
    setUser(null);
    setProfile(null);
  };

  const hasRole = (role) => profile?.role === role;
  const hasAnyRole = (roles) => roles.includes(profile?.role);

  const value = {
    user,
    profile,
    loading,
    login,
    logout,
    hasRole,
    hasAnyRole,
    isAdmin: profile?.role === 'admin',
    isOperator: profile?.role === 'operator',
    isPilot: profile?.role === 'pilot',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export default AuthContext;
