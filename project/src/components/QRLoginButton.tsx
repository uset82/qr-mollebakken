import { useState } from 'react';
import { QrCode } from 'lucide-react';
import { QRScanner } from './QRScanner';

interface QRLoginButtonProps {
  onScan: (text: string) => Promise<void>;
  isLoading?: boolean;
}

export function QRLoginButton({ onScan, isLoading = false }: QRLoginButtonProps) {
  const [showScanner, setShowScanner] = useState(false);

  const handleScan = async (text: string) => {
    try {
      await onScan(text);
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setShowScanner(false);
    }
  };

  if (showScanner) {
    return (
      <div className="space-y-4">
        <QRScanner onResult={handleScan} />
        <button
          onClick={() => setShowScanner(false)}
          className="w-full py-2 text-gray-600 hover:text-gray-900"
          disabled={isLoading}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowScanner(true)}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <QrCode className="w-5 h-5" />
      Sign in with QR Code
    </button>
  );
}