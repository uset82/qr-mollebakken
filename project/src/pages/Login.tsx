import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AlertCircle, WifiOff } from 'lucide-react';
import { QRLoginButton } from '../components/QRLoginButton';

export function Login() {
  const navigate = useNavigate();
  const { signIn, signInWithQR, user, isLoading, isOnline } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (user && !isLoading) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSigningIn(true);

    try {
      await signIn('123', '123');
      navigate('/');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Authentication failed');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleQRLogin = async (qrData: string) => {
    setError(null);
    setIsSigningIn(true);
    
    try {
      await signInWithQR(qrData);
      navigate('/');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Invalid QR code');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome to ArtConnect</h2>
          <p className="text-gray-600 mt-2">
            Sign in to view your child's artwork
          </p>
        </div>

        {!isOnline && (
          <div className="mb-6 bg-yellow-50 p-4 rounded-lg flex items-center gap-3 text-yellow-800">
            <WifiOff className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">
              You're currently offline. Please check your internet connection to sign in.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              defaultValue="123"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled={!isOnline || isSigningIn}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              defaultValue="123"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled={!isOnline || isSigningIn}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isOnline || isSigningIn}
          >
            {isSigningIn ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <QRLoginButton onScan={handleQRLogin} isLoading={!isOnline || isSigningIn} />
          </div>
        </div>
      </div>
    </div>
  );
}