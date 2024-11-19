import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRGeneratorProps {
  parentId: string;
}

export function QRGenerator({ parentId }: QRGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const qrData = `mollebakken:parent:${parentId}`;
      QRCode.toCanvas(canvasRef.current, qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#4F46E5',
          light: '#FFFFFF',
        },
      }).catch(console.error);
    }
  }, [parentId]);

  const downloadQR = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `parent-qr-${parentId}.png`;
      link.href = url;
      link.click();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <canvas ref={canvasRef} />
      </div>
      <button
        onClick={downloadQR}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Download QR Code
      </button>
      <p className="text-sm text-gray-500 text-center mt-2">
        Scan this QR code to log in as a test parent
      </p>
    </div>
  );
}