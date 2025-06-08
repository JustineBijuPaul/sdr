import { useEffect } from 'react';

// Preload critical resources
export function preloadCriticalResources() {
  // Preload logo
  const logoLink = document.createElement('link');
  logoLink.rel = 'preload';
  logoLink.href = '/sdrlogo.png';
  logoLink.as = 'image';
  document.head.appendChild(logoLink);

  // Preload Google Fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preconnect';
  fontLink.href = 'https://fonts.googleapis.com';
  document.head.appendChild(fontLink);

  const fontGstaticLink = document.createElement('link');
  fontGstaticLink.rel = 'preconnect';
  fontGstaticLink.href = 'https://fonts.gstatic.com';
  fontGstaticLink.crossOrigin = 'anonymous';
  document.head.appendChild(fontGstaticLink);

  // Preload Cloudinary domain
  const cloudinaryLink = document.createElement('link');
  cloudinaryLink.rel = 'dns-prefetch';
  cloudinaryLink.href = 'https://res.cloudinary.com';
  document.head.appendChild(cloudinaryLink);
}

// Image optimization utility
export function optimizeImage(src: string, width?: number, height?: number, quality = 80): string {
  if (!src || !src.includes('cloudinary.com')) {
    return src;
  }

  let optimizedUrl = src;
  
  // Add transformations
  const transformations = [];
  
  if (width && height) {
    transformations.push(`c_fill,w_${width},h_${height}`);
  } else if (width) {
    transformations.push(`w_${width}`);
  } else if (height) {
    transformations.push(`h_${height}`);
  }
  
  transformations.push(`q_${quality}`);
  transformations.push('f_auto'); // Auto format
  
  // Insert transformations into Cloudinary URL
  const uploadIndex = optimizedUrl.indexOf('/upload/');
  if (uploadIndex !== -1) {
    const beforeUpload = optimizedUrl.substring(0, uploadIndex + 8);
    const afterUpload = optimizedUrl.substring(uploadIndex + 8);
    optimizedUrl = `${beforeUpload}${transformations.join(',')}/${afterUpload}`;
  }
  
  return optimizedUrl;
}

// Lazy loading observer
export function useLazyLoading() {
  useEffect(() => {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    });

    // Observe all images with data-src attribute
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => imageObserver.observe(img));

    return () => imageObserver.disconnect();
  }, []);
}

// Performance monitoring (without console logging)
export function usePerformanceMonitoring() {
  useEffect(() => {
    // Monitor Core Web Vitals
    if ('web-vital' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        // Monitor metrics without logging to console
        // In production, these would be sent to analytics service
        getCLS((metric) => {
          // Send to analytics service if needed
        });
        getFID((metric) => {
          // Send to analytics service if needed
        });
        getFCP((metric) => {
          // Send to analytics service if needed
        });
        getLCP((metric) => {
          // Send to analytics service if needed
        });
        getTTFB((metric) => {
          // Send to analytics service if needed
        });
      });
    }

    // Monitor page load performance
    window.addEventListener('load', () => {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        const metrics = {
          dns: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcp: navigation.connectEnd - navigation.connectStart,
          request: navigation.responseStart - navigation.requestStart,
          response: navigation.responseEnd - navigation.responseStart,
          dom: navigation.domContentLoadedEventEnd - navigation.responseEnd,
          load: navigation.loadEventEnd - navigation.loadEventStart,
          total: navigation.loadEventEnd - navigation.navigationStart
        };

        // Store metrics for analytics (instead of console logging)
        // In production, send to analytics service
      }
    });
  }, []);
}

// Critical CSS inlining utility
export function inlineCriticalCSS() {
  const criticalCSS = `
    /* Critical CSS for above-the-fold content */
    .header { display: block; }
    .hero-section { display: block; }
    .loading-skeleton { 
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }
    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;

  const style = document.createElement('style');
  style.textContent = criticalCSS;
  document.head.appendChild(style);
}

// Component for implementing performance optimizations
export default function PerformanceOptimizer() {
  useEffect(() => {
    // Preload critical resources
    preloadCriticalResources();
    
    // Inline critical CSS
    inlineCriticalCSS();
  }, []);

  // Use performance monitoring
  usePerformanceMonitoring();
  
  // Use lazy loading
  useLazyLoading();

  return null;
} 