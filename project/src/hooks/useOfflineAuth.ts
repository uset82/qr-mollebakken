import { useState, useEffect, useCallback } from 'react';
import { getAuthCache, saveAuthCache, clearAuthCache } from '../lib/offline-store';
import { useNetworkStatus } from './useNetworkStatus';

const OFFLINE_AUTH_KEY = 'offline_auth_state';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

interface OfflineAuth {
  email: string;
  token: string;
  timestamp: number;
}

export function useOfflineAuth() {
  const [offlineAuth, setOfflineAuth] = useState<OfflineAuth | null>(null);
  const isOnline = useNetworkStatus();

  const loadOfflineAuth = useCallback(async () => {
    try {
      const cached = await getAuthCache(OFFLINE_AUTH_KEY);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setOfflineAuth(cached);
      } else if (cached) {
        await clearAuthCache();
        setOfflineAuth(null);
      }
    } catch (error) {
      console.error('Failed to load offline auth:', error);
      setOfflineAuth(null);
    }
  }, []);

  useEffect(() => {
    if (!isOnline) {
      loadOfflineAuth();
    } else {
      setOfflineAuth(null);
    }
  }, [isOnline, loadOfflineAuth]);

  const cacheAuthState = async (email: string, token: string) => {
    try {
      const authState: OfflineAuth = {
        email,
        token,
        timestamp: Date.now()
      };
      await saveAuthCache(OFFLINE_AUTH_KEY, authState);
    } catch (error) {
      console.error('Failed to cache auth state:', error);
    }
  };

  const clearOfflineAuth = async () => {
    try {
      await clearAuthCache();
      setOfflineAuth(null);
    } catch (error) {
      console.error('Failed to clear offline auth:', error);
    }
  };

  return {
    offlineAuth,
    cacheAuthState,
    clearOfflineAuth,
    isOfflineEnabled: !!offlineAuth
  };
}