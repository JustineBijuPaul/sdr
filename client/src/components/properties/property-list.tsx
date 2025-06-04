import React from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import PropertyCard from './property-card';
import { Loader2 } from 'lucide-react';
import { PropertyWithRelations } from '@shared/schema';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define sort options
const sortOptions = [
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "area_asc", label: "Area: Small to Large" },
  { value: "area_desc", label: "Area: Large to Small" },
  { value: "date_desc", label: "Newest First" },
  { value: "date_asc", label: "Oldest First" },
];

interface ApiResponse {
  properties: PropertyWithRelations[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export default function PropertyList() {
  const [location, setLocation] = useLocation();
  
  // Extract the query parameters from the URL
  const searchParams = location.includes('?') 
    ? new URLSearchParams(location.split('?')[1]) 
    : new URLSearchParams();
  
  // Get current sort from URL or default to date_desc
  const currentSort = searchParams.get('sort') || 'date_desc';
  
  // Build API URL with query parameters
  const queryString = searchParams.toString();
  const apiUrl = `/api/properties${queryString ? `?${queryString}` : ''}`;
  
  // Handle sort change
  const handleSortChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', value);
    newParams.set('page', '1'); // Reset to first page when sorting changes
    setLocation(`/properties?${newParams.toString()}`, { replace: true });
  };
  
  // Fetch properties with React Query
  const { data, error, isLoading } = useQuery<ApiResponse>({
    queryKey: [apiUrl],
  });
  
  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading properties...</span>
      </div>
    );
  }
  
  // Handle error state
  if (error) {
    console.error("Error fetching properties:", error);
    return (
      <div className="text-center p-8 text-red-500">
        <h3 className="text-xl font-bold">Error loading properties</h3>
        <p>Please try again later</p>
      </div>
    );
  }
  
  // Handle empty results
  if (!data?.properties || data.properties.length === 0) {
    return (
      <div className="text-center p-8">
        <h3 className="text-xl font-bold">No properties found</h3>
        <p>Try adjusting your filters</p>
      </div>
    );
  }
  
  return (
    <div>
      {/* Sort Controls */}
      <div className="flex justify-end mb-6">
        <Select value={currentSort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}
