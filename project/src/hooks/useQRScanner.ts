import { useState, useCallback, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface UseQRScannerOptions {
  fps?: number;
  qrboxSize?: number;
  aspectRatio?: number;
}

export function useQRScanner({ 
  fps = 10, 
  qrboxSize = 250,
  aspectRatio = 1.0
}: UseQRScannerOptions = {}) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const stopScanning = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
    }
    setIsScanning(false);
    setError(null);
  }, []);

  const startScanning = useCallback((onResult: (text: string) => void) => {
    setIsScanning(true);
    setError(null);

    // Ensure any existing scanner is cleared
    stopScanning();

    // Wait for the DOM to be ready
    setTimeout(() => {
      const element = document.getElementById('qr-reader');
      if (!element) {
        setError('QR scanner initialization failed');
        setIsScanning(false);
        return;
      }

      try {
        scannerRef.current = new Html5QrcodeScanner(
          'qr-reader',
          { 
            fps, 
            qrbox: { width: qrboxSize, height: qrboxSize / aspectRatio },
            rememberLastUsedCamera: true,
            showTorchButtonIfSupported: true
          },
          false
        );

        scannerRef.current.render(
          (text) => {
            onResult(text);
            stopScanning();
          },
          (err) => {
            console.warn('QR Scan error:', err);
            setError('Failed to scan QR code. Please try again.');
          }
        );
      } catch (err) {
        console.error('Scanner initialization error:', err);
        setError('Failed to initialize camera. Please try again.');
        setIsScanning(false);
      }
    }, 100);

    return stopScanning;
  }, [fps, qrboxSize, aspectRatio, stopScanning]);

  return {
    isScanning,
    error,
    startScanning,
    stopScanning
  };
}