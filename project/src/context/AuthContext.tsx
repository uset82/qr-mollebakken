import { createContext, useEffect, useState, ReactNode } from 'react';
import { auth, db, collections, handleFirebaseError } from '../lib/firebase';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  UserCredential,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { collection, query, where, getDocs, limit, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useOfflineAuth } from '../hooks/useOfflineAuth';

interface User {
  id: string;
  email: string;
  role: 'parent' | 'admin';
}

interface AuthContextType {
  user: User | null;
  signIn: (username: string, password: string) => Promise<void>;
  signInWithQR: (qrData: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isLoading: boolean;
  isOnline: boolean;
  retryAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  signIn: async () => {},
  signInWithQR: async () => {},
  signOut: async () => {},
  isAdmin: false,
  isLoading: true,
  isOnline: true,
  retryAuth: async () => {}
});

const MAX_AUTH_RETRIES = 3;
const AUTH_RETRY_DELAY = 2000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const isOnline = useNetworkStatus();
  const { offlineAuth, cacheAuthState, clearOfflineAuth } = useOfflineAuth();

  const initializeAuth = async () => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      return true;
    } catch (error) {
      console.error('Failed to initialize auth persistence:', error);
      return false;
    }
  };

  const retryAuth = async () => {
    if (retryCount >= MAX_AUTH_RETRIES) {
      toast.error('Unable to connect to authentication service. Please try again later.');
      return;
    }

    setRetryCount(prev => prev + 1);
    await new Promise(resolve => setTimeout(resolve, AUTH_RETRY_DELAY));
    
    try {
      const success = await initializeAuth();
      if (success) {
        setAuthError(null);
        setRetryCount(0);
      }
    } catch (error) {
      console.error('Auth retry failed:', error);
      setAuthError(error instanceof Error ? error : new Error('Authentication failed'));
    }
  };

  useEffect(() => {
    let unsubscribe = () => {};

    const setupAuth = async () => {
      try {
        await initializeAuth();
        
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          setIsLoading(true);
          try {
            if (firebaseUser) {
              const userData = {
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                role: 'parent'
              };
              setUser(userData);

              if (isOnline && firebaseUser.email) {
                const token = await firebaseUser.getIdToken();
                await cacheAuthState(firebaseUser.email, token);
              }
            } else {
              setUser(null);
              setIsAdmin(false);
              await clearOfflineAuth();
            }
          } catch (error) {
            console.error('Auth state change error:', error);
          } finally {
            setIsLoading(false);
          }
        });
      } catch (error) {
        console.error('Auth setup failed:', error);
        setAuthError(error instanceof Error ? error : new Error('Authentication setup failed'));
        setIsLoading(false);
      }
    };

    setupAuth();
    return () => unsubscribe();
  }, [isOnline, cacheAuthState, clearOfflineAuth]);

  useEffect(() => {
    if (!isOnline && offlineAuth && !user) {
      setUser({
        id: 'offline',
        email: offlineAuth.email,
        role: 'parent'
      });
    }
  }, [isOnline, offlineAuth, user]);

  const handleAuthOperation = async <T extends (...args: any[]) => Promise<any>>(
    operation: T,
    ...args: Parameters<T>
  ): Promise<void> => {
    if (!isOnline) {
      toast.error('Cannot perform authentication while offline');
      throw new Error('offline');
    }

    try {
      await operation(...args);
    } catch (error) {
      if (error instanceof Error && error.message.includes('network')) {
        await retryAuth();
      }
      handleFirebaseError(error);
    }
  };

  const signIn = async (username: string, password: string) => {
    await handleAuthOperation(async () => {
      const email = `${username}@mollebakken.internal`;
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const token = await credential.user.getIdToken();
      await cacheAuthState(email, token);
      toast.success('Welcome back!');
    });
  };

  const signInWithQR = async (qrData: string) => {
    await handleAuthOperation(async () => {
      const [prefix, type, parentId] = qrData.split(':');
      
      if (prefix !== 'mollebakken' || type !== 'parent') {
        throw new Error('Invalid QR code format');
      }

      const q = query(
        collection(db, collections.parentAuth),
        where('parent_id', '==', parentId),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        throw new Error('Invalid parent ID');
      }

      const tokenDoc = snapshot.docs[0];
      const { token } = tokenDoc.data();
      const email = `parent-${parentId}@mollebakken.internal`;

      let userCredential: UserCredential;

      try {
        userCredential = await signInWithEmailAndPassword(auth, email, token);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          userCredential = await createUserWithEmailAndPassword(auth, email, token);
          await setDoc(doc(db, collections.users, userCredential.user.uid), {
            email,
            role: 'parent',
            parent_id: parentId,
            created_at: serverTimestamp()
          });
        } else {
          throw error;
        }
      }

      const newToken = await userCredential.user.getIdToken();
      await cacheAuthState(email, newToken);
      toast.success('Welcome to ArtConnect!');
    });
  };

  const signOut = async () => {
    await handleAuthOperation(async () => {
      await firebaseSignOut(auth);
      await clearOfflineAuth();
      toast.success('Signed out successfully');
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      signIn, 
      signInWithQR, 
      signOut, 
      isAdmin, 
      isLoading,
      isOnline,
      retryAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
}