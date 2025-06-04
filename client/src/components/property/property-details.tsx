import { Property, PropertyWithRelations, NearbyFacility } from "@shared/schema";
import { 
  Badge 
} from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Bed, 
  Bath, 
  Maximize, 
  Home, 
  Calendar, 
  MapPin, 
  Compass, 
  Car, 
  Tag, 
  Phone, 
  ScrollText, 
  Building,
  CheckCircle2
} from "lucide-react";

interface PropertyDetailsProps {
  property: PropertyWithRelations;
  facilities?: NearbyFacility[];
}

export default function PropertyDetails({ property, facilities = [] }: PropertyDetailsProps) {
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
  
  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold">{property.title}</h1>
            <p className="text-gray-600 flex items-center mt-2">
              <MapPin className="h-4 w-4 mr-2 text-primary" />
              {property.contactDetails.split(',')[0]}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">
              {formatPrice(property.price, property.status)}
              {property.priceNegotiable && (
                <span className="text-sm font-normal text-gray-500 ml-2">(Negotiable)</span>
              )}
            </div>
            <Badge variant={property.status === "sale" ? "sale" : "rent"} className="mt-2">
              For {property.status === "sale" ? "Sale" : "Rent"}
            </Badge>
          </div>
        </div>
        
        {/* Key details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
          {property.bedrooms && (
            <div className="flex items-center">
              <Bed className="h-5 w-5 mr-2 text-primary" />
              <span>{property.bedrooms} {property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
            </div>
          )}
          
          {property.bathrooms && (
            <div className="flex items-center">
              <Bath className="h-5 w-5 mr-2 text-primary" />
              <span>{property.bathrooms} {property.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}</span>
            </div>
          )}
          
          <div className="flex items-center">
            <Maximize className="h-5 w-5 mr-2 text-primary" />
            <span>{property.area} {property.areaUnit}</span>
          </div>
          
          <div className="flex items-center">
            <Building className="h-5 w-5 mr-2 text-primary" />
            <span>{property.furnishedStatus}</span>
          </div>
        </div>
      </div>
      
      {/* Property details card */}
      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="flex items-start">
              <Home className="h-5 w-5 mr-3 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Property Type</p>
                <p className="font-medium">{property.propertyType} - {property.subType}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Tag className="h-5 w-5 mr-3 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium capitalize">{property.category}</p>
              </div>
            </div>
            
            {property.portion && (
              <div className="flex items-start">
                <ScrollText className="h-5 w-5 mr-3 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Portion</p>
                  <p className="font-medium">{property.portion}</p>
                </div>
              </div>
            )}
            
            {property.balconies !== null && property.balconies !== undefined && (
              <div className="flex items-start">
                <Home className="h-5 w-5 mr-3 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Balconies</p>
                  <p className="font-medium">{property.balconies}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-start">
              <Compass className="h-5 w-5 mr-3 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Facing</p>
                <p className="font-medium">{property.facing}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Car className="h-5 w-5 mr-3 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Parking</p>
                <p className="font-medium">{property.parking}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Calendar className="h-5 w-5 mr-3 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Age of Property</p>
                <p className="font-medium">{property.age} {property.age === 1 ? 'year' : 'years'}</p>
              </div>
            </div>
            
            {property.brokerage && (
              <div className="flex items-start">
                <Phone className="h-5 w-5 mr-3 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Brokerage</p>
                  <p className="font-medium">{property.brokerage}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Description card */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p>{property.description}</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Nearby facilities section */}
      {facilities && facilities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Nearby Facilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {facilities.map((facility) => (
                <div key={facility.id} className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-3 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">{facility.facilityName}</p>
                    <p className="text-sm text-gray-500">{facility.facilityType} - {facility.distance} km</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
