import { useState } from "react";
import { PropertyMedia } from "@shared/schema";
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

type PropertyGalleryProps = {
  media: PropertyMedia[];
};

export default function PropertyGallery({ media }: PropertyGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // If there are no images, show a placeholder
  if (!media || media.length === 0) {
    return (
      <div className="rounded-lg overflow-hidden bg-gray-200 h-96 flex items-center justify-center">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  // Find the featured image or use the first available
  const featuredImage = media.find(item => item.isFeatured) || media[0];

  // Get all images (excluding videos)
  const images = media.filter(item => item.mediaType === 'image');
  
  // Get all videos
  const videos = media.filter(item => item.mediaType === 'video');

  const navigateImage = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentImageIndex(prev => 
        prev === 0 ? images.length - 1 : prev - 1
      );
    } else {
      setCurrentImageIndex(prev => 
        prev === images.length - 1 ? 0 : prev + 1
      );
    }
  };

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        {/* Main Image */}
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogTrigger asChild>
            <div className="md:col-span-3 rounded-lg overflow-hidden cursor-pointer h-96">
              <img 
                src={featuredImage.cloudinaryUrl} 
                alt="Property" 
                className="w-full h-full object-cover"
              />
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-4xl bg-black/90 border-none">
            <VisuallyHidden>
              <DialogTitle>Property Image Gallery</DialogTitle>
              <DialogDescription>
                View and navigate through property images. Use the arrow buttons to move between images.
              </DialogDescription>
            </VisuallyHidden>
            <div className="relative">
              <div className="flex justify-center items-center h-[80vh]">
                <img 
                  src={images[currentImageIndex].cloudinaryUrl} 
                  alt="Property" 
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full"
                onClick={() => navigateImage('prev')}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full"
                onClick={() => navigateImage('next')}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-2 top-2 bg-black/50 text-white rounded-full"
                onClick={() => setLightboxOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
                {currentImageIndex + 1} / {images.length}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Thumbnail Grid */}
        <div className="md:col-span-1">
          <div className="grid grid-cols-2 md:grid-cols-1 gap-2 h-full">
            {images.slice(0, 3).map((item, index) => (
              <div 
                key={item.id} 
                className="rounded-lg overflow-hidden cursor-pointer h-28"
                onClick={() => {
                  setCurrentImageIndex(index);
                  setLightboxOpen(true);
                }}
              >
                <img 
                  src={item.cloudinaryUrl} 
                  alt={`Property ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {images.length > 3 && (
              <div 
                className="relative rounded-lg overflow-hidden cursor-pointer h-28"
                onClick={() => {
                  setCurrentImageIndex(3);
                  setLightboxOpen(true);
                }}
              >
                <img 
                  src={images[3].cloudinaryUrl} 
                  alt={`Property 4`} 
                  className="w-full h-full object-cover"
                />
                {images.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-medium">+{images.length - 4} more</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Tour Section */}
      {videos.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3">Video Tour</h3>
          <div className="rounded-lg overflow-hidden aspect-video">
            <video 
              src={videos[0].cloudinaryUrl} 
              controls 
              className="w-full h-full object-cover"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </div>
  );
}
