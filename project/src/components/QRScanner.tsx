import { useEffect, useRef } from 'react';
import { Scan } from 'lucide-react';
import { useQRScanner } from '../hooks/useQRScanner';

interface QRScannerProps {
  onResult: (text: string) => void;
  autoStart?: boolean;
}

export function QRScanner({ onResult, autoStart = false }: QRScannerProps) {
  const { isScanning, error, startScanning, stopScanning } = useQRScanner();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoStart && containerRef.current) {
      return startScanning(onResult);
    }
  }, [autoStart, onResult, startScanning]);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  if (!isScanning) {
    return (
      <button
        onClick={() => startScanning(onResult)}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <Scan className="w-5 h-5" />
        Scan QR Code
      </button>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <div ref={containerRef} id="qr-reader" className="w-full" />
      {error && (
        <p className="text-red-600 text-sm text-center mt-2">{error}</p>
      )}
      <button
        onClick={stopScanning}
        className="mt-4 w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
      >
        Cancel Scan
      </button>
    </div>
  );
}