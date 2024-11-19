import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import { getArtwork, type Artwork } from '../lib/firestore';
import { MediaViewer } from '../components/MediaViewer';
import toast from 'react-hot-toast';

export function ArtworkView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadArtwork = async () => {
      if (!id) return;
      
      try {
        const artworkData = await getArtwork(id);
        setArtwork(artworkData);
      } catch (error) {
        toast.error('Failed to load artwork');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    loadArtwork();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Artwork not found</h2>
        <p className="text-gray-600 mt-2">
          The artwork you're looking for doesn't exist or you don't have access to it.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{artwork.title}</h1>
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar className="w-5 h-5" />
              <span>{new Date(artwork.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="mb-8">
            <MediaViewer
              type={artwork.type}
              url={artwork.url}
              title={artwork.title}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About the Artwork</h2>
              <p className="text-gray-600 mb-4">{artwork.description}</p>
              <div className="flex items-center gap-2 text-gray-500">
                <User className="w-5 h-5" />
                <span>Created by {artwork.student_name}</span>
              </div>
            </div>

            {artwork.teacher_notes && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Teacher's Notes</h2>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-gray-600">{artwork.teacher_notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}