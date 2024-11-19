import { useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface MediaViewerProps {
  type: 'image' | 'video' | 'audio';
  url: string;
  title: string;
}

export function MediaViewer({ type, url, title }: MediaViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  if (type === 'image') {
    return (
      <div className="relative group">
        <img
          src={url}
          alt={title}
          className="w-full rounded-lg shadow-md"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded-lg" />
      </div>
    );
  }

  if (type === 'video') {
    return (
      <div className="relative rounded-lg shadow-md overflow-hidden">
        <video
          src={url}
          className="w-full"
          controls
          playsInline
          poster={`${url}?poster=true`}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          muted={isMuted}
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                const video = document.querySelector('video');
                if (video) {
                  if (isPlaying) {
                    video.pause();
                  } else {
                    video.play();
                  }
                }
              }}
              className="text-white hover:text-indigo-200 transition-colors"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-white hover:text-indigo-200 transition-colors"
            >
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'audio') {
    return (
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => {
              const audio = document.querySelector('audio');
              if (audio) {
                if (isPlaying) {
                  audio.pause();
                } else {
                  audio.play();
                }
              }
            }}
            className="text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
          </button>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">Audio Recording</p>
          </div>
        </div>
        <audio
          src={url}
          className="w-full"
          controls
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      </div>
    );
  }

  return null;
}