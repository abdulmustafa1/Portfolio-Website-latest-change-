import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 md:top-6 md:right-6 p-2 md:p-3 text-white hover:text-teal-400 
                   transition-all duration-300 bg-black/70 rounded-full hover:bg-black/90 z-50
                   border border-gray-600 hover:border-teal-400"
      >
        <X className="w-6 h-6 md:w-8 md:h-8" />
      </button>

      {/* Video Container */}
      <div className="max-w-4xl w-full aspect-video" onClick={(e) => e.stopPropagation()}>
        <video
          src={videoUrl}
          controls
          autoPlay
          className="w-full h-full rounded-lg shadow-2xl"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default VideoPlayer;