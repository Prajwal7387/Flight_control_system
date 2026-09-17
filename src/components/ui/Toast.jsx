import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: 'bg-success-50 text-success-600 border-success-400',
  error: 'bg-danger-50 text-danger-600 border-danger-400',
  warning: 'bg-warning-50 text-warning-600 border-warning-400',
  info: 'bg-primary-50 text-primary-600 border-primary-400',
};

export default function Toast({ message, type = 'info', duration = 4000, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const Icon = iconMap[type] || Info;

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg transition-all duration-300 ${
        colorMap[type]
      } ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
    >
      <Icon size={18} className="flex-shrink-0" />
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={() => { setVisible(false); setTimeout(onClose, 300); }} className="flex-shrink-0 hover:opacity-70">
        <X size={16} />
      </button>
    </div>
  );
}
