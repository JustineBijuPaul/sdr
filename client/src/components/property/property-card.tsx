import { Property, PropertyWithRelations, PropertyMedia } from "@shared/schema";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Heart, MapPin, Bath, Bed, SquareIcon } from "lucide-react";

interface PropertyCardProps {
  property: PropertyWithRelations;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  // Format price display based on status (sale/rent)
  const formatPrice = (price: number, status: string) => {
    // For sale properties
    if (status === "sale") {
      if (price >= 10000000) {
        return `₹${(price / 10000000).toFixed(2)} Cr`;
      } else if (price >= 100000) {
        return `₹${(price / 100000).toFixed(2)} L`;
      } else {
        return `₹${price.toLocaleString()}`;
      }
    } 
    // For rent properties
    else {
      if (price >= 100000) {
        return `₹${(price / 100000).toFixed(2)} L/mo`;
      } else {
        return `₹${price.toLocaleString()}/mo`;
      }
    }
  };

  // Format area based on unit
  const formatArea = (area: number, unit: string) => {
    return `${area} ${unit}`;
  };

  // Find the featured image or use the first available
  const getFeaturedImage = () => {
    if (!property.media || property.media.length === 0) {
      return "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
    }

    const featuredImage = property.media.find((item: PropertyMedia) => item.isFeatured);
    return featuredImage ? featuredImage.cloudinaryUrl : property.media[0].cloudinaryUrl;
  };

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition">
      <div className="relative">
        <img 
          src={getFeaturedImage()} 
          alt={property.title}
          className="w-full h-64 object-cover"
        />
        <Badge 
          variant={property.status === "sale" ? "sale" : "rent"} 
          className="absolute top-4 left-4 px-3 py-1"
        >
          For {property.status === "sale" ? "Sale" : "Rent"}
        </Badge>
        <button className="absolute top-4 right-4 bg-white/80 p-2 rounded-full hover:bg-white transition">
          <Heart className="h-5 w-5 text-primary" />
        </button>
      </div>
      
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/properties/${property.slug}`}>
            <h3 className="text-xl font-bold hover:text-primary cursor-pointer">{property.title}</h3>
          </Link>
          <p className="text-xl font-bold text-primary">
            {formatPrice(property.price, property.status)}
          </p>
        </div>
        
        <p className="text-gray-600 mb-4 flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-primary" />
          {property.contactDetails.split(',')[0]}
        </p>
        
        <div className="flex justify-between text-sm text-gray-600 border-t border-gray-100 pt-4">
          {property.bedrooms && (
            <span className="flex items-center">
              <Bed className="h-4 w-4 mr-1" /> {property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}
            </span>
          )}
          
          {property.bathrooms && (
            <span className="flex items-center">
              <Bath className="h-4 w-4 mr-1" /> {property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}
            </span>
          )}
          
          <span className="flex items-center">
            <SquareIcon className="h-4 w-4 mr-1" /> {formatArea(property.area, property.areaUnit)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
