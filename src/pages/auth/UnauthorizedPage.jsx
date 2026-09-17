import { useNavigate } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 bg-danger-50 rounded-full flex items-center justify-center mb-4">
        <ShieldX size={32} className="text-danger-500" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
      <p className="text-gray-500 mb-6 max-w-md">
        You do not have permission to access this page. Please contact your administrator if you believe this is an error.
      </p>
      <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
    </div>
  );
}
