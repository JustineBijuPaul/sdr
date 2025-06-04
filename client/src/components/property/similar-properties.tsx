import { useQuery } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import PropertyCard from "@/components/property/property-card";
import { Loader2 } from "lucide-react";

interface SimilarPropertiesProps {
  propertyId: number;
  propertyType: string;
  status: string;
  location: string;
}

export default function SimilarProperties({ propertyId, propertyType, status, location }: SimilarPropertiesProps) {
  // Build query string to find similar properties
  const queryString = `propertyType=${encodeURIComponent(propertyType)}&status=${status}&location=${encodeURIComponent(location)}&limit=3`;
  
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: [`/api/properties?${queryString}`],
  });
  
  // Filter out the current property
  const similarProperties = properties?.filter(p => p.id !== propertyId) || [];
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!similarProperties.length) {
    return null;
  }
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Similar Properties</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {similarProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}
