import QRCode from 'qrcode';

export async function generateParentQR(parentId: string): Promise<string> {
  try {
    const qrData = `mollebakken:parent:${parentId}`;
    return await QRCode.toDataURL(qrData, {
      width: 256,
      margin: 2,
      color: {
        dark: '#4F46E5',
        light: '#FFFFFF',
      },
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

export function parseParentQR(qrData: string): { parentId: string } | null {
  try {
    const [prefix, type, parentId] = qrData.split(':');
    
    if (prefix !== 'mollebakken' || type !== 'parent' || !parentId) {
      return null;
    }

    return { parentId };
  } catch {
    return null;
  }
}