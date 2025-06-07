import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  structuredData?: object;
  noindex?: boolean;
}

const DEFAULT_SEO = {
  title: 'South Delhi Realty - Premium Real Estate in South Delhi',
  description: 'Find your dream property in South Delhi. Premium apartments, independent houses, villas, and commercial spaces in Greater Kailash, Defence Colony, Lajpat Nagar & more.',
  keywords: 'south delhi real estate, properties in south delhi, apartments south delhi, independent houses south delhi, commercial property south delhi, greater kailash properties, defence colony real estate',
  image: '/sdrlogo.png',
  url: 'https://southdelhirealty.com',
};

export default function SEOHead({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  structuredData,
  noindex = false
}: SEOProps) {
  const seoTitle = title ? `${title} | South Delhi Realty` : DEFAULT_SEO.title;
  const seoDescription = description || DEFAULT_SEO.description;
  const seoKeywords = keywords || DEFAULT_SEO.keywords;
  const seoImage = image || DEFAULT_SEO.image;
  const seoUrl = url || DEFAULT_SEO.url;

  useEffect(() => {
    // Update document title
    document.title = seoTitle;

    // Function to update or create meta tag
    const updateMeta = (name: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Basic meta tags
    updateMeta('description', seoDescription);
    updateMeta('keywords', seoKeywords);
    updateMeta('author', 'South Delhi Realty');
    
    // Viewport and responsive
    let viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      viewport.content = 'width=device-width, initial-scale=1.0';
      document.head.appendChild(viewport);
    }

    // Robots
    if (noindex) {
      updateMeta('robots', 'noindex, nofollow');
    } else {
      updateMeta('robots', 'index, follow');
    }

    // Open Graph tags
    updateMeta('og:title', seoTitle, true);
    updateMeta('og:description', seoDescription, true);
    updateMeta('og:type', type, true);
    updateMeta('og:url', seoUrl, true);
    updateMeta('og:image', seoImage.startsWith('http') ? seoImage : `${DEFAULT_SEO.url}${seoImage}`, true);
    updateMeta('og:site_name', 'South Delhi Realty', true);
    updateMeta('og:locale', 'en_IN', true);

    // Twitter Card tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', seoTitle);
    updateMeta('twitter:description', seoDescription);
    updateMeta('twitter:image', seoImage.startsWith('http') ? seoImage : `${DEFAULT_SEO.url}${seoImage}`);

    // Additional SEO tags
    updateMeta('theme-color', '#007bff');
    updateMeta('msapplication-TileColor', '#007bff');

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = seoUrl;

    // Structured Data
    if (structuredData) {
      let script = document.querySelector('#structured-data') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = 'structured-data';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }

  }, [seoTitle, seoDescription, seoKeywords, seoImage, seoUrl, type, structuredData, noindex]);

  return null;
}

// Utility function to generate property structured data
export const generatePropertyStructuredData = (property: any) => {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateOffer",
    "name": property.title,
    "description": property.description,
    "price": property.price,
    "priceCurrency": "INR",
    "availability": "https://schema.org/InStock",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "price": property.price,
      "priceCurrency": "INR",
      "unitText": property.status === 'rent' ? 'per month' : 'total'
    },
    "realEstateAgent": {
      "@type": "RealEstateAgent",
      "name": "South Delhi Realty",
      "url": "https://southdelhirealty.com",
      "telephone": "+91-99112-48822",
      "email": "southdelhirealty@gmail.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "M-15, Greater Kailash Part 1",
        "addressLocality": "New Delhi",
        "addressRegion": "Delhi",
        "postalCode": "110048",
        "addressCountry": "IN"
      }
    },
    "image": property.media?.[0]?.cloudinaryUrl,
    "floorSize": {
      "@type": "QuantitativeValue",
      "value": property.area,
      "unitText": property.areaUnit
    },
    "numberOfRooms": property.bedrooms,
    "numberOfBathroomsTotal": property.bathrooms,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "South Delhi",
      "addressRegion": "Delhi",
      "addressCountry": "IN"
    },
    "geo": property.latitude && property.longitude ? {
      "@type": "GeoCoordinates",
      "latitude": property.latitude,
      "longitude": property.longitude
    } : undefined
  };
};

// Utility function to generate organization structured data
export const generateOrganizationStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "South Delhi Realty",
    "url": "https://southdelhirealty.com",
    "logo": "https://southdelhirealty.com/sdrlogo.png",
    "description": "Premier real estate agency specializing in South Delhi properties. Expert services for buying, selling, and renting residential and commercial properties.",
    "telephone": "+91-99112-48822",
    "email": "southdelhirealty@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "M-15, Greater Kailash Part 1",
      "addressLocality": "New Delhi",
      "addressRegion": "Delhi",
      "postalCode": "110048",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 28.5494,
      "longitude": 77.2232
    },
    "openingHours": "Mo-Sa 09:00-19:00",
    "priceRange": "₹₹₹",
    "areaServed": [
      "Greater Kailash",
      "Defence Colony",
      "Lajpat Nagar",
      "Khan Market",
      "Safdarjung",
      "Green Park",
      "Hauz Khas",
      "Vasant Vihar",
      "South Extension"
    ],
    "sameAs": [
      "https://www.facebook.com/profile.php?id=100091444635702",
      "https://www.instagram.com/southdelhirealty"
    ]
  };
}; 