import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 'md', message = 'Loading...' }) {
  const sizeMap = { sm: 20, md: 32, lg: 48 };
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <Loader2 size={sizeMap[size]} className="animate-spin text-primary-500" />
      {message && <p className="text-sm text-gray-500">{message}</p>}
    </div>
  );
}
