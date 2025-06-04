import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as Indian Rupees (₹)
 * @param amount The amount to format
 * @returns Formatted amount with ₹ symbol
 */
export function formatIndianRupees(amount: number): string {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });
  
  return formatter.format(amount);
}

export function formatPrice(price: number): string {
  // For Indian format: ₹XX,XX,XXX
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} Lac`;
  } else {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  }
}

export function getCloudinaryUrl(url: string, options?: {
  width?: number;
  height?: number;
  quality?: number;
  crop?: 'fill' | 'crop' | 'scale' | 'thumb';
  format?: 'auto' | 'webp' | 'jpg' | 'png';
}) {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  try {
    // Default options
    const { 
      width = 600, 
      height, 
      quality = 'auto', 
      crop = 'fill',
      format = 'auto'
    } = options || {};

    // Find the upload part in the URL
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) return url;

    // Split the URL at the upload part
    const firstPart = url.substring(0, uploadIndex + 8); // include "/upload/"
    const secondPart = url.substring(uploadIndex + 8);

    // Build transformation string
    let transformation = `c_${crop},q_${quality},f_${format}`;
    if (width) transformation += `,w_${width}`;
    if (height) transformation += `,h_${height}`;

    // Combine URL with transformation
    return `${firstPart}${transformation}/${secondPart}`;
  } catch (error) {
    console.error('Error optimizing Cloudinary URL:', error);
    return url;
  }
}
