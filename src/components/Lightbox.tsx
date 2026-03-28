import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxProps {
  images: Array<{ src: string; alt: string; title?: string }>;
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const Lightbox: React.FC<LightboxProps> = ({ images, currentIndex, onClose, onNavigate }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') navigatePrevious();
      if (e.key === 'ArrowRight') navigateNext();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [currentIndex, onClose]);

  const navigatePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    onNavigate(newIndex);
  };

  const navigateNext = () => {
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    onNavigate(newIndex);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-20 right-4 md:top-24 md:right-6 p-2 md:p-3 text-white hover:text-teal-400 
                   transition-all duration-300 bg-black/70 rounded-full hover:bg-black/90 z-[70]
                   border border-gray-600 hover:border-teal-400"
      >
        <X className="w-6 h-6 md:w-8 md:h-8" />
      </button>

      {/* Previous Button */}
      <button
        onClick={navigatePrevious}
        className="absolute left-4 md:left-6 top-1/2 transform -translate-y-1/2 p-2 md:p-3 
                   text-white hover:text-teal-400 transition-all duration-300 
                   bg-black/70 rounded-full hover:bg-black/90 z-[70]
                   border border-gray-600 hover:border-teal-400"
      >
        <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
      </button>

      {/* Next Button */}
      <button
        onClick={navigateNext}
        className="absolute right-4 md:right-6 top-1/2 transform -translate-y-1/2 p-2 md:p-3 
                   text-white hover:text-teal-400 transition-all duration-300 
                   bg-black/70 rounded-full hover:bg-black/90 z-[70]
                   border border-gray-600 hover:border-teal-400"
      >
        <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
      </button>

      {/* Image Container */}
      <div className="max-w-5xl max-h-full flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <img
          src={images[currentIndex].src}
          alt={images[currentIndex].alt}
          className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
        />
        {images[currentIndex].title && (
          <p className="text-center text-white mt-4 text-lg font-medium">{images[currentIndex].title}</p>
        )}
      </div>

      {/* Image Counter */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 
                      text-white text-sm bg-black/70 px-4 py-2 rounded-full border border-gray-600">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

export default Lightbox;