import { useState, useRef } from 'react';
import { Upload, Image, Video, Mic } from 'lucide-react';
import { students } from '../lib/students';
import { uploadMedia, type MediaType, getMediaCount } from '../lib/storage';
import { createArtwork } from '../lib/firestore';
import toast from 'react-hot-toast';

interface UploadFormProps {
  onUploadComplete: () => void;
}

export function UploadForm({ onUploadComplete }: UploadFormProps) {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('image');
  const [uploading, setUploading] = useState(false);
  const [quotas, setQuotas] = useState<Record<MediaType, number>>({
    image: 0,
    video: 0,
    audio: 0
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateQuotas = async (studentId: string) => {
    try {
      const [images, videos, audios] = await Promise.all([
        getMediaCount(studentId, 'image'),
        getMediaCount(studentId, 'video'),
        getMediaCount(studentId, 'audio')
      ]);
      
      setQuotas({
        image: images,
        video: videos,
        audio: audios
      });
    } catch (error) {
      console.error('Error updating quotas:', error);
    }
  };

  const handleStudentChange = async (studentId: string) => {
    setSelectedStudent(studentId);
    if (studentId) {
      await updateQuotas(studentId);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedStudent || !title.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setUploading(true);
    try {
      const url = await uploadMedia({
        studentId: selectedStudent,
        file,
        type: mediaType
      });

      await createArtwork({
        title: title.trim(),
        description: description.trim(),
        type: mediaType,
        url,
        student_id: selectedStudent,
        parent_id: students.find(s => s.id === selectedStudent)?.id || '',
        student_name: students.find(s => s.id === selectedStudent)?.name || ''
      });
      
      toast.success('Artwork uploaded successfully');
      await updateQuotas(selectedStudent);
      onUploadComplete();
      
      // Reset form
      setTitle('');
      setDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Upload failed. Please try again.');
      }
      
      // Retry getting quotas after error
      if (selectedStudent) {
        setTimeout(() => updateQuotas(selectedStudent), 1000);
      }
    } finally {
      setUploading(false);
    }
  };

  const mediaTypes: { type: MediaType; icon: typeof Image; label: string }[] = [
    { type: 'image', icon: Image, label: 'Image' },
    { type: 'video', icon: Video, label: 'Video' },
    { type: 'audio', icon: Mic, label: 'Audio' }
  ];

  const getQuotaLabel = (type: MediaType) => {
    const used = quotas[type];
    const max = {
      image: 3,
      video: 1,
      audio: 1
    }[type];
    return `${used}/${max} ${type}s used`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload Artwork</h2>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="student" className="block text-sm font-medium text-gray-700 mb-2">
            Select Student
          </label>
          <select
            id="student"
            value={selectedStudent}
            onChange={(e) => handleStudentChange(e.target.value)}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            disabled={uploading}
          >
            <option value="">Choose a student...</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Media Type
          </label>
          <div className="grid grid-cols-3 gap-4">
            {mediaTypes.map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => setMediaType(type)}
                className={`flex flex-col items-center p-4 rounded-lg border ${
                  mediaType === type
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300'
                } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={uploading}
              >
                <Icon className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">{label}</span>
                {selectedStudent && (
                  <span className="text-xs text-gray-500 mt-1">
                    {getQuotaLabel(type)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            disabled={uploading}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            disabled={uploading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload File
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className={`relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 ${
                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    ref={fileInputRef}
                    type="file"
                    className="sr-only"
                    onChange={handleUpload}
                    accept={
                      mediaType === 'image'
                        ? 'image/*'
                        : mediaType === 'video'
                        ? 'video/*'
                        : 'audio/*'
                    }
                    disabled={uploading || !selectedStudent}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">
                {mediaType === 'video'
                  ? 'Max 20 seconds, 50MB limit'
                  : mediaType === 'audio'
                  ? 'Max 1 minute, 10MB limit'
                  : 'PNG, JPG, GIF up to 10MB'}
              </p>
            </div>
          </div>
        </div>

        {uploading && (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2 text-sm text-gray-600">Uploading...</span>
          </div>
        )}
      </div>
    </div>
  );
}