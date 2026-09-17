import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import { Plane, Shield, Users, Briefcase } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('admin');

  const handleDemoLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(selectedRole);
      toast.success(`Logged in as ${selectedRole.toUpperCase()}`);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'admin', label: 'Administrator', icon: Shield, desc: 'Full system access' },
    { id: 'operator', label: 'Flight Operator', icon: Briefcase, desc: 'Manage flights & resources' },
    { id: 'pilot', label: 'Pilot', icon: Users, desc: 'View assignments & report emergencies' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-sky-900 flex items-center justify-center p-4">
      {/* Background patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary-500/20 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-sky-500/20 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 animate-slide-up">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-sky-500 rounded-2xl shadow-lg flex items-center justify-center mb-4">
              <Plane size={32} className="text-white transform -rotate-45" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Flight Control</h1>
            <p className="text-primary-200 text-sm mt-1">Academic Demonstration Portal</p>
          </div>

          <div className="mb-6 bg-primary-500/20 border border-primary-400/30 rounded-lg p-3 text-sm text-primary-100 text-center">
            Database connection is mocked via LocalStorage. Select a role below to start.
          </div>

          <form onSubmit={handleDemoLogin} className="space-y-4">
            <div className="space-y-3">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={`w-full flex items-center p-4 rounded-xl border transition-all ${
                    selectedRole === role.id
                      ? 'bg-white/20 border-white shadow-inner'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedRole === role.id ? 'bg-primary-500 text-white' : 'bg-white/10 text-primary-200'
                  }`}>
                    <role.icon size={20} />
                  </div>
                  <div className="ml-4 text-left">
                    <p className={`font-semibold ${selectedRole === role.id ? 'text-white' : 'text-primary-100'}`}>
                      {role.label}
                    </p>
                    <p className={`text-xs ${selectedRole === role.id ? 'text-primary-100' : 'text-primary-300'}`}>
                      {role.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg shadow-lg shadow-primary-500/25 mt-6"
              loading={loading}
            >
              Start Demonstration
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
