import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNetworkStatus } from './useNetworkStatus';
import toast from 'react-hot-toast';

export function useAuth() {
  const context = useContext(AuthContext);
  const isOnline = useNetworkStatus();

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  // Wrap authentication methods with network status checks
  const wrappedContext = {
    ...context,
    signIn: async (...args: Parameters<typeof context.signIn>) => {
      if (!isOnline) {
        toast.error('You are offline. Please check your internet connection.');
        throw new Error('offline');
      }
      return context.signIn(...args);
    },
    signInWithQR: async (...args: Parameters<typeof context.signInWithQR>) => {
      if (!isOnline) {
        toast.error('You are offline. Please check your internet connection.');
        throw new Error('offline');
      }
      return context.signInWithQR(...args);
    },
    signOut: async () => {
      if (!isOnline) {
        toast.error('You are offline. Please check your internet connection.');
        throw new Error('offline');
      }
      return context.signOut();
    },
    isOnline
  };

  return wrappedContext;
}