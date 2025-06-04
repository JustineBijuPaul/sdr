import { useProgressiveImg, getLowQualityUrl } from '@/hooks/use-progressive-img';
import { getCloudinaryUrl } from '@/lib/utils';

interface CloudinaryImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export function CloudinaryImage({
  src,
  alt,
  className = '',
  width,
  height,
  objectFit = 'cover',
}: CloudinaryImageProps) {
  // Optimize the image URL if it's from Cloudinary
  const optimizedSrc = getCloudinaryUrl(src, { 
    width: width || 600,
    height: height,
    quality: 80,
    format: 'auto',
    crop: 'fill'
  });
  
  // Get a low-quality preview for progressive loading
  const lowQualitySrc = getLowQualityUrl(src);
  
  // Use progressive loading
  const [imgSrc, isLoaded, hasError] = useProgressiveImg(lowQualitySrc, optimizedSrc);

  // Simple placeholder SVG for when image fails to load
  const placeholderSvg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjYWFhYWFhIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

  // If the image URL is not valid or doesn't start with http, show placeholder
  if (!src || (!src.startsWith('http') && !src.startsWith('data:'))) {
    return (
      <div 
        className={`${className} flex items-center justify-center bg-gray-100`}
        style={{ width, height }}
      >
        <span className="text-gray-400">No image</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-pulse h-4 w-16 bg-gray-200 rounded"></div>
        </div>
      )}
      
      <img
        src={hasError ? placeholderSvg : imgSrc}
        alt={alt}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-80'} transition-opacity duration-500`}
        style={{ 
          objectFit,
          width: width ? `${width}px` : '100%',
          height: height ? `${height}px` : '100%',
          filter: isLoaded ? 'none' : 'blur(10px)',
          transition: 'filter 0.3s ease-out'
        }}
      />
    </div>
  );
} 