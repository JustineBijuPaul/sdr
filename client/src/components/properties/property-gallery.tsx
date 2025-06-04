import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { PropertyMedia } from "@shared/schema";
import { ChevronLeft, ChevronRight, Film, Image as ImageIcon, Play, X } from "lucide-react";
import { useState } from "react";

type PropertyGalleryProps = {
  media: PropertyMedia[];
};

export default function PropertyGallery({ media }: PropertyGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showAllMedia, setShowAllMedia] = useState(false);

  // If there are no media items, show a placeholder
  if (!media || media.length === 0) {
    return (
      <div className="rounded-lg overflow-hidden bg-gray-200 h-96 flex items-center justify-center mb-8">
        <div className="text-center">
          <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No media available</p>
        </div>
      </div>
    );
  }

  // Separate images and videos
  const images = media.filter(item => item.mediaType === 'image');
  const videos = media.filter(item => item.mediaType === 'video');
  
  // Find the featured image or use the first available
  const featuredMedia = media.find(item => item.isFeatured) || media[0];
  
  // All media for lightbox
  const allMedia = [...images, ...videos];

  const navigateMedia = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentIndex(prev => 
        prev === 0 ? allMedia.length - 1 : prev - 1
      );
    } else {
      setCurrentIndex(prev => 
        prev === allMedia.length - 1 ? 0 : prev + 1
      );
    }
  };

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  // Get display media (limited or all based on toggle)
  const getDisplayMedia = () => {
    if (showAllMedia) {
      return allMedia;
    }
    // Show main featured + up to 8 thumbnails
    const otherMedia = allMedia.filter(item => item.id !== featuredMedia.id);
    return [featuredMedia, ...otherMedia.slice(0, 8)];
  };

  const displayMedia = getDisplayMedia();
  const remainingCount = allMedia.length - 9; // Featured + 8 thumbnails

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Property Gallery</h2>
          <div className="flex gap-2">
            {images.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <ImageIcon className="h-3 w-3" />
                {images.length} Photo{images.length !== 1 ? 's' : ''}
              </Badge>
            )}
            {videos.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Film className="h-3 w-3" />
                {videos.length} Video{videos.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
        {allMedia.length > 9 && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAllMedia(!showAllMedia)}
          >
            {showAllMedia ? 'Show Less' : `View All ${allMedia.length} Media`}
          </Button>
        )}
      </div>

      {/* Fixed Size Gallery Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        {/* Main Fixed-Size Media Viewer */}
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogTrigger asChild>
            <div 
              className="lg:col-span-3 rounded-lg overflow-hidden cursor-pointer relative group bg-gray-100"
              style={{ height: '400px' }} // Fixed height
              onClick={() => openLightbox(allMedia.findIndex(item => item.id === featuredMedia.id))}
            >
              {featuredMedia.mediaType === 'image' ? (
                <img 
                  src={featuredMedia.cloudinaryUrl} 
                  alt="Featured Property" 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="relative w-full h-full bg-black">
                  <video 
                    src={featuredMedia.cloudinaryUrl}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                    <div className="bg-white/90 rounded-full p-3 shadow-lg">
                      <Play className="h-8 w-8 text-black" />
                    </div>
                  </div>
                </div>
              )}
              <div className="absolute top-3 left-3">
                <Badge className="bg-black/70 text-white">
                  {featuredMedia.mediaType === 'image' ? 'Featured' : 'Video Tour'}
                </Badge>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
          </DialogTrigger>

          {/* Lightbox Content - Also Fixed Size */}
          <DialogContent className="max-w-5xl w-full bg-black/95 border-none p-4">
            <VisuallyHidden>
              <DialogTitle>Property Media Gallery</DialogTitle>
              <DialogDescription>
                View and navigate through property images and videos. Use the arrow buttons to move between media items.
              </DialogDescription>
            </VisuallyHidden>
            <div className="relative w-full" style={{ height: '70vh' }}>
              <div className="w-full h-full flex items-center justify-center bg-black/50 rounded-lg overflow-hidden">
                {allMedia[currentIndex]?.mediaType === 'image' ? (
                  <img 
                    src={allMedia[currentIndex]?.cloudinaryUrl} 
                    alt="Property" 
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <video 
                    src={allMedia[currentIndex]?.cloudinaryUrl}
                    controls
                    autoPlay
                    className="max-h-full max-w-full object-contain"
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
              
              {/* Navigation Controls */}
              {allMedia.length > 1 && (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                    onClick={() => navigateMedia('prev')}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                    onClick={() => navigateMedia('next')}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}
              
              {/* Close Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-4 top-4 bg-black/50 hover:bg-black/70 text-white rounded-full"
                onClick={() => setLightboxOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
              
              {/* Media Counter and Info */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full">
                <div className="flex items-center gap-2">
                  {allMedia[currentIndex]?.mediaType === 'video' && <Film className="h-4 w-4" />}
                  <span>{currentIndex + 1} / {allMedia.length}</span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Fixed-Size Thumbnail Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-2">
          {displayMedia.slice(1, 9).map((item, index) => (
            <div 
              key={item.id} 
              className="rounded-lg overflow-hidden cursor-pointer relative group bg-gray-100"
              style={{ height: '95px' }} // Fixed height for thumbnails
              onClick={() => openLightbox(allMedia.findIndex(media => media.id === item.id))}
            >
              {item.mediaType === 'image' ? (
                <img 
                  src={item.cloudinaryUrl} 
                  alt={`Property ${index + 2}`} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="relative w-full h-full bg-black">
                  <video 
                    src={item.cloudinaryUrl}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="bg-white/90 rounded-full p-1.5">
                      <Play className="h-3 w-3 text-black" />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Overlay for "+X more" on last thumbnail when not showing all */}
              {!showAllMedia && index === 6 && remainingCount > 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">+{remainingCount} more</span>
                </div>
              )}
              
              {/* Media type indicator */}
              {item.mediaType === 'video' && (
                <div className="absolute top-1 right-1">
                  <Badge variant="secondary" className="text-xs py-0 px-1">
                    <Film className="h-2 w-2 mr-1" />
                    Video
                  </Badge>
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
          ))}
          
          {/* Show remaining thumbnails if showing all media */}
          {showAllMedia && displayMedia.slice(9).map((item, index) => (
            <div 
              key={item.id} 
              className="rounded-lg overflow-hidden cursor-pointer relative group bg-gray-100"
              style={{ height: '95px' }}
              onClick={() => openLightbox(allMedia.findIndex(media => media.id === item.id))}
            >
              {item.mediaType === 'image' ? (
                <img 
                  src={item.cloudinaryUrl} 
                  alt={`Property ${index + 10}`} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="relative w-full h-full bg-black">
                  <video 
                    src={item.cloudinaryUrl}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="bg-white/90 rounded-full p-1.5">
                      <Play className="h-3 w-3 text-black" />
                    </div>
                  </div>
                </div>
              )}
              
              {item.mediaType === 'video' && (
                <div className="absolute top-1 right-1">
                  <Badge variant="secondary" className="text-xs py-0 px-1">
                    <Film className="h-2 w-2 mr-1" />
                    Video
                  </Badge>
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {/* Media Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Total: {allMedia.length} media files</span>
          {images.length > 0 && <span>• {images.length} images</span>}
          {videos.length > 0 && <span>• {videos.length} videos</span>}
        </div>
        <span>All media watermarked with SOUTH DELHI REALTY</span>
      </div>
    </div>
  );
}
