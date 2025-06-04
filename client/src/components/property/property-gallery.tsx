import { useState } from "react";
import { PropertyMedia } from "@shared/schema";
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Play 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PropertyGalleryProps {
  media: PropertyMedia[];
}

export default function PropertyGallery({ media }: PropertyGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  
  // Filter media by type
  const images = media.filter(item => item.mediaType === "image");
  const videos = media.filter(item => item.mediaType === "video");
  
  // Combine media with images first, then videos
  const allMedia = [...images, ...videos];
  
  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };
  
  const closeLightbox = () => {
    setLightboxOpen(false);
  };
  
  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? allMedia.length - 1 : prev - 1));
  };
  
  const nextImage = () => {
    setCurrentIndex((prev) => (prev === allMedia.length - 1 ? 0 : prev + 1));
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") prevImage();
    if (e.key === "ArrowRight") nextImage();
  };
  
  if (!allMedia.length) {
    return (
      <div className="bg-gray-100 rounded-lg h-[400px] flex items-center justify-center">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative rounded-lg overflow-hidden h-[400px] bg-gray-100">
        {allMedia[currentIndex]?.mediaType === "video" ? (
          <video 
            src={allMedia[currentIndex].cloudinaryUrl} 
            className="w-full h-full object-contain cursor-pointer"
            controls
          />
        ) : (
          <img 
            src={allMedia[currentIndex].cloudinaryUrl} 
            alt="Property" 
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => openLightbox(currentIndex)}
          />
        )}
        
        {/* Navigation buttons */}
        {allMedia.length > 1 && (
          <>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={prevImage} 
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/50 hover:bg-white/75 rounded-full"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={nextImage} 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/50 hover:bg-white/75 rounded-full"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}
        
        {/* Media count indicator */}
        <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {allMedia.length}
        </div>
      </div>
      
      {/* Thumbnails */}
      {allMedia.length > 1 && (
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2 overflow-x-auto">
          {allMedia.map((item, index) => (
            <div 
              key={item.id} 
              className={`relative rounded-md overflow-hidden h-20 ${index === currentIndex ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setCurrentIndex(index)}
            >
              {item.mediaType === "video" ? (
                <div className="relative h-full">
                  <img 
                    src={item.cloudinaryUrl.replace(/\.[^/.]+$/, ".jpg")} 
                    alt={`Video thumbnail ${index + 1}`}
                    className="w-full h-full object-cover cursor-pointer"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                </div>
              ) : (
                <img 
                  src={item.cloudinaryUrl} 
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover cursor-pointer"
                />
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Lightbox */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="relative max-w-5xl max-h-screen p-4">
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={closeLightbox} 
              className="absolute right-6 top-6 bg-black/50 hover:bg-black/75 text-white rounded-full z-10"
            >
              <X className="h-6 w-6" />
            </Button>
            
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              {allMedia[currentIndex]?.mediaType === "video" ? (
                <video 
                  src={allMedia[currentIndex].cloudinaryUrl} 
                  className="max-w-full max-h-[80vh] mx-auto"
                  controls
                  autoPlay
                />
              ) : (
                <img 
                  src={allMedia[currentIndex].cloudinaryUrl} 
                  alt="Property" 
                  className="max-w-full max-h-[80vh] mx-auto"
                />
              )}
              
              {/* Lightbox navigation */}
              {allMedia.length > 1 && (
                <>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={(e) => { e.stopPropagation(); prevImage(); }} 
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white rounded-full"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={(e) => { e.stopPropagation(); nextImage(); }} 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white rounded-full"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>
            
            {/* Lightbox caption/counter */}
            <div className="text-center text-white mt-4">
              Image {currentIndex + 1} of {allMedia.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
