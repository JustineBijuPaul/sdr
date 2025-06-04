import { useState, useEffect } from 'react';
import { getCloudinaryUrl } from '@/lib/utils';

// This hook loads a low-quality image first, then the full-quality image
export const useProgressiveImg = (
  lowQualitySrc: string, 
  highQualitySrc: string
): [string, boolean, boolean] => {
  const [src, setSrc] = useState(lowQualitySrc || highQualitySrc);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!highQualitySrc) {
      setError(true);
      return;
    }

    // Reset state when source changes
    setSrc(lowQualitySrc || highQualitySrc);
    setIsLoaded(false);
    setError(false);

    // Create a new image object
    const img = new Image();
    img.src = highQualitySrc;
    
    img.onload = () => {
      setSrc(highQualitySrc);
      setIsLoaded(true);
    };
    
    img.onerror = () => {
      console.error('Error loading image:', highQualitySrc);
      setError(true);
    };
    
    // Cleanup function
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [lowQualitySrc, highQualitySrc]);

  return [src, isLoaded, error];
};

// Helper function to create low-quality preview URLs for Cloudinary
export const getLowQualityUrl = (url: string): string => {
  if (!url || !url.includes('cloudinary.com')) {
    return '';
  }
  
  return getCloudinaryUrl(url, {
    width: 20,
    quality: 10,
    format: 'webp',
    crop: 'fill'
  });
}; 