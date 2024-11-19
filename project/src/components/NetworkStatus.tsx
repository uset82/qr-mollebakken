import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { WifiOff } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export function NetworkStatus() {
  const isOnline = useNetworkStatus();

  useEffect(() => {
    if (!isOnline) {
      toast.error('You are offline. Some features may be limited.');
    }
  }, [isOnline]);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
      <WifiOff className="w-5 h-5" />
      <span>You're offline</span>
    </div>
  );
}