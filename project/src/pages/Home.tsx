import { useState } from 'react';
import { Image, Video, Mic, QrCode, Upload } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs, startAfter, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getAllArtworks, type Artwork } from '../lib/firestore';
import toast from 'react-hot-toast';
import { UploadForm } from '../components/UploadForm';
import { QRScanner } from '../components/QRScanner';

const ARTWORKS_PER_PAGE = 12;

export function Home() {
  const [view, setView] = useState<'select' | 'teacher' | 'parent'>('select');
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot>();
  const [hasMore, setHasMore] = useState(true);
  const [showQRScanner, setShowQRScanner] = useState(false);

  const loadArtworks = async (loadMore = false) => {
    try {
      setLoadingMore(loadMore);
      const result = await getAllArtworks(loadMore ? lastDoc : undefined);
      
      setArtworks(prev => loadMore ? [...prev, ...result.artworks] : result.artworks);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error loading artworks:', error);
      toast.error('Failed to load artworks');
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  const handleQRScan = async (qrData: string) => {
    try {
      // Handle QR code scanning logic here
      console.log('QR Data:', qrData);
      toast.success('QR code scanned successfully');
      setShowQRScanner(false);
    } catch (error) {
      console.error('QR scan error:', error);
      toast.error('Invalid QR code');
    }
  };

  if (view === 'select') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
          <button
            onClick={() => setView('teacher')}
            className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-center group"
          >
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-200 transition-colors">
              <Upload className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Teacher Access</h2>
            <p className="text-gray-600">Upload and manage student artwork</p>
          </button>

          <button
            onClick={() => setView('parent')}
            className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-center group"
          >
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-200 transition-colors">
              <QrCode className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Parent Access</h2>
            <p className="text-gray-600">View your child's artwork via QR code</p>
          </button>
        </div>
      </div>
    );
  }

  if (view === 'parent') {
    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setView('select')}
          className="mb-8 text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
        >
          ← Back to selection
        </button>

        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Parent Access</h2>
          <p className="text-gray-600 mb-8">
            Scan your QR code to view your child's artwork collection
          </p>

          {showQRScanner ? (
            <QRScanner
              onResult={handleQRScan}
              autoStart={true}
            />
          ) : (
            <button
              onClick={() => setShowQRScanner(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <QrCode className="w-5 h-5" />
              Scan QR Code
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setView('select')}
          className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
        >
          ← Back to selection
        </button>
      </div>

      <section className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Teacher Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Upload and manage student artwork
        </p>
      </section>

      <UploadForm onUploadComplete={() => loadArtworks()} />

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recent Uploads</h2>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : artworks.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {artworks.map((artwork) => (
                <div
                  key={artwork.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                    {artwork.type === 'image' ? (
                      <img
                        src={artwork.url}
                        alt={artwork.title}
                        className="object-cover w-full h-full"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex items-center justify-center">
                        {artwork.type === 'video' ? (
                          <Video className="w-8 h-8 text-gray-400" />
                        ) : (
                          <Mic className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900">{artwork.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">By {artwork.student_name}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => loadArtworks(true)}
                  disabled={loadingMore}
                  className="bg-white text-indigo-600 px-6 py-2 rounded-lg border border-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-50"
                >
                  {loadingMore ? (
                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No artworks found yet. Upload some artwork to get started!</p>
          </div>
        )}
      </section>
    </div>
  );
}