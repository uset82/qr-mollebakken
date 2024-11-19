import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import { storage } from './firebase';
import { students } from './students';
import toast from 'react-hot-toast';

export type MediaType = 'image' | 'video' | 'audio';

interface UploadOptions {
  studentId: string;
  file: File;
  type: MediaType;
  onProgress?: (progress: number) => void;
}

interface StorageQuota {
  maxImages: number;
  maxVideos: number;
  maxAudios: number;
  maxVideoLength: number;
  maxAudioLength: number;
  maxVideoSize: number;
  maxAudioSize: number;
}

const STORAGE_QUOTA: StorageQuota = {
  maxImages: 3,
  maxVideos: 1,
  maxAudios: 1,
  maxVideoLength: 20,
  maxAudioLength: 60,
  maxVideoSize: 50 * 1024 * 1024,
  maxAudioSize: 10 * 1024 * 1024
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

async function retryOperation<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    if (
      retries > 0 &&
      (error.code === 'storage/retry-limit-exceeded' ||
       error.code === 'storage/network-failed')
    ) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryOperation(operation, retries - 1, delay * 1.5);
    }
    throw error;
  }
}

async function validateMediaQuota(studentId: string, type: MediaType): Promise<boolean> {
  const student = students.find(s => s.id === studentId);
  if (!student) return false;

  try {
    const folderRef = ref(storage, `students/${student.folderName}/${type}s`);
    const files = await retryOperation(() => listAll(folderRef));

    switch (type) {
      case 'image':
        return files.items.length < STORAGE_QUOTA.maxImages;
      case 'video':
        return files.items.length < STORAGE_QUOTA.maxVideos;
      case 'audio':
        return files.items.length < STORAGE_QUOTA.maxAudios;
      default:
        return false;
    }
  } catch (error) {
    console.error('Error validating quota:', error);
    throw new Error('Failed to validate storage quota');
  }
}

async function validateMediaFile(file: File, type: MediaType): Promise<boolean> {
  return new Promise((resolve) => {
    switch (type) {
      case 'video':
        if (file.size > STORAGE_QUOTA.maxVideoSize) {
          toast.error('Video file is too large. Maximum size is 50MB.');
          resolve(false);
          return;
        }
        
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src);
          if (video.duration > STORAGE_QUOTA.maxVideoLength) {
            toast.error('Video is too long. Maximum length is 20 seconds.');
            resolve(false);
          } else {
            resolve(true);
          }
        };
        video.onerror = () => {
          URL.revokeObjectURL(video.src);
          toast.error('Invalid video file');
          resolve(false);
        };
        video.src = URL.createObjectURL(file);
        break;

      case 'audio':
        if (file.size > STORAGE_QUOTA.maxAudioSize) {
          toast.error('Audio file is too large. Maximum size is 10MB.');
          resolve(false);
          return;
        }
        
        const audio = document.createElement('audio');
        audio.preload = 'metadata';
        audio.onloadedmetadata = () => {
          URL.revokeObjectURL(audio.src);
          if (audio.duration > STORAGE_QUOTA.maxAudioLength) {
            toast.error('Audio is too long. Maximum length is 1 minute.');
            resolve(false);
          } else {
            resolve(true);
          }
        };
        audio.onerror = () => {
          URL.revokeObjectURL(audio.src);
          toast.error('Invalid audio file');
          resolve(false);
        };
        audio.src = URL.createObjectURL(file);
        break;

      case 'image':
        const img = new Image();
        img.onload = () => {
          URL.revokeObjectURL(img.src);
          resolve(true);
        };
        img.onerror = () => {
          URL.revokeObjectURL(img.src);
          toast.error('Invalid image file');
          resolve(false);
        };
        img.src = URL.createObjectURL(file);
        break;

      default:
        resolve(false);
    }
  });
}

export async function getMediaCount(studentId: string, type: MediaType): Promise<number> {
  const student = students.find(s => s.id === studentId);
  if (!student) return 0;

  try {
    const folderRef = ref(storage, `students/${student.folderName}/${type}s`);
    const files = await retryOperation(() => listAll(folderRef));
    return files.items.length;
  } catch (error) {
    console.error('Error getting media count:', error);
    return 0;
  }
}

export async function uploadMedia({ studentId, file, type, onProgress }: UploadOptions): Promise<string> {
  const student = students.find(s => s.id === studentId);
  if (!student) {
    throw new Error('Student not found');
  }

  try {
    // Check quota
    const hasQuota = await validateMediaQuota(studentId, type);
    if (!hasQuota) {
      const quotaMessage = {
        image: '3 images',
        video: '1 video',
        audio: '1 audio recording'
      }[type];
      throw new Error(`Storage quota exceeded. Maximum allowed: ${quotaMessage}`);
    }

    // Validate file
    const isValid = await validateMediaFile(file, type);
    if (!isValid) {
      throw new Error('File validation failed');
    }

    const timestamp = new Date().toISOString();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = `students/${student.folderName}/${type}s/${fileName}`;
    
    const storageRef = ref(storage, filePath);
    
    // Upload with retry
    await retryOperation(() => uploadBytes(storageRef, file));
    
    // Get download URL with retry
    const downloadURL = await retryOperation(() => getDownloadURL(storageRef));
    
    return downloadURL;
  } catch (error: any) {
    console.error('Upload failed:', error);
    
    if (error.code === 'storage/unauthorized') {
      throw new Error('You do not have permission to upload files');
    }
    
    if (error.code === 'storage/quota-exceeded') {
      throw new Error('Storage quota exceeded. Please contact support.');
    }
    
    if (error.code === 'storage/retry-limit-exceeded') {
      throw new Error('Upload failed due to network issues. Please try again.');
    }
    
    throw new Error('Failed to upload file. Please try again.');
  }
}