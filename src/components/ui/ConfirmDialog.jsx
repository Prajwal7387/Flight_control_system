import { AlertTriangle } from 'lucide-react';
import Button from './Button';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, loading = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md animate-slide-up p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-danger-50 rounded-full flex items-center justify-center">
            <AlertTriangle size={20} className="text-danger-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}
