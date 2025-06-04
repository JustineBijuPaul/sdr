import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PropertyWithRelations } from '@shared/schema';
import { Bed, Bath, Square, MapPin, Home } from 'lucide-react';

interface PropertyCardProps {
  property: PropertyWithRelations;
  showFullDetails?: boolean;
}

// Helper function to format currency
function formatCurrency(amount: number, isRent: boolean): string {
  // For prices in lakhs and crores (Indian format)
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  } else {
    return `₹${amount.toLocaleString()}${isRent ? '/month' : ''}`;
  }
}

export default function PropertyCard({ property, showFullDetails = false }: PropertyCardProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageError, setImageError] = useState<boolean>(false);
  
  // Log property details for debugging
  useEffect(() => {
    console.log('Property received:', property);
    console.log('Raw property media:', property.media);
    
    // Create a mapped version of the property for logging
    const mappedProperty = {
      id: property.id,
      title: property.title,
      slug: property.slug,
      price: property.price,
      status: property.status,
      propertyType: property.propertyType,
      category: property.category
    };
    
    console.log('Mapped property:', mappedProperty);
  }, [property]);
  
  // Get media for property
  useEffect(() => {
    try {
      // Output the media structure for debugging
      console.log('Media debug:', {
        hasMedia: !!property.media,
        mediaLength: property.media?.length,
        mediaType: typeof property.media,
        firstItem: property.media?.[0],
        hasFeaturedImage: !!(property as any).featured_image
      });

      // First try to use property.media array if it exists
      if (property.media && Array.isArray(property.media) && property.media.length > 0) {
        // Find featured image or use first image
        const featuredImage = property.media.find(m => 
          m.isFeatured === true || (m as any).is_featured === true
        ) || property.media[0];
        
        // Handle different property structures
        if (featuredImage) {
          // Try to get cloudinaryUrl or cloudinary_url
          const imageUrl = 
            featuredImage.cloudinaryUrl || 
            (featuredImage as any).cloudinary_url || 
            '';
          
          if (imageUrl) {
            console.log('Found image URL in media array:', imageUrl);
            setImageSrc(imageUrl);
          }
        }
      } 
      // Fallback to featured_image if available
      else if ((property as any).featured_image) {
        console.log('Using fallback featured_image:', (property as any).featured_image);
        setImageSrc((property as any).featured_image);
      }
      // Last resort - log that no image was found
      else {
        console.warn('No media found for property:', property.id);
      }
    } catch (err) {
      console.error('Error loading property image:', err);
    }
  }, [property]);
  
  // Format price with currency symbol
  const formattedPrice = formatCurrency(property.price, property.status === 'rent');
  
  // Get badge color based on status
  const statusBadgeVariant = property.status === 'sale' ? 'default' : 'secondary';
  
  // Get status label
  const statusLabel = property.status === 'sale' ? 'For Sale' : 'For Rent';
  
  // Handle image load error
  const handleImageError = () => {
    console.error('Failed to load image:', imageSrc);
    setImageError(true);
    setImageSrc(null);
  };
  
  return (
    <Link href={`/property/${property.slug}`}>
      <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer">
        <div className="relative">
          {/* Property Image */}
          <div className="h-64 bg-muted overflow-hidden">
            {imageSrc && !imageError ? (
              <img 
                src={imageSrc} 
                alt={property.title} 
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                <Home className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-xs text-gray-500">No image available</p>
              </div>
            )}
          </div>
          
          {/* Status Badge */}
          <Badge 
            variant={statusBadgeVariant} 
            className="absolute top-3 left-3 text-sm font-medium px-2.5 py-1"
            data-status={property.status}
          >
            {statusLabel}
          </Badge>
        </div>
        
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
            <p className="font-bold text-primary">{formattedPrice}</p>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
            <span className="capitalize">{property.category}</span> • {property.propertyType?.replace(/_/g, ' ')}
          </p>
        </CardHeader>
        
        <CardContent className="p-4 pt-2 pb-4">
          <div className="flex justify-between mt-2">
            {property.bedrooms ? (
              <div className="flex items-center">
                <Bed className="h-4 w-4 mr-1" />
                <span className="text-sm">
                  {property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}
                </span>
              </div>
            ) : (
              <div />
            )}
            
            {property.bathrooms ? (
              <div className="flex items-center">
                <Bath className="h-4 w-4 mr-1" />
                <span className="text-sm">
                  {property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}
                </span>
              </div>
            ) : (
              <div />
            )}
            
            {property.area ? (
              <div className="flex items-center">
                <Square className="h-4 w-4 mr-1" />
                <span className="text-sm">{property.area} sq. ft</span>
              </div>
            ) : (
              <div />
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
