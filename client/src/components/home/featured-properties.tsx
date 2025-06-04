import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Bed, Bath, Square, Heart } from "lucide-react";
import { PropertyWithRelations } from "@shared/schema";
import PropertyCard from "../properties/property-card";
import { Skeleton } from "@/components/ui/skeleton";

// Define a proper API response type
interface ApiResponse {
  properties?: PropertyWithRelations[];
  data?: PropertyWithRelations[];
  [key: string]: any;
}

export default function FeaturedProperties() {
  const { data, isLoading } = useQuery<PropertyWithRelations[] | ApiResponse>({
    queryKey: ['/api/properties?isActive=true&include=media'],
  });

  // Fix: Check the structure of the data and access the properties array correctly
  const properties = Array.isArray(data) ? data : data?.properties || data?.data || [];
  
  // Featured properties should be limited to 3-6 for display
  const featuredProperties = properties?.slice(0, 3);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold">Featured Properties</h2>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" className="rounded-full">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading && (
            <>
              <FeaturedPropertySkeleton />
              <FeaturedPropertySkeleton />
              <FeaturedPropertySkeleton />
            </>
          )}

          {featuredProperties?.map((property: PropertyWithRelations) => (
            <PropertyCard key={property.id} property={property} />
          ))}

          {!isLoading && featuredProperties?.length === 0 && (
            <div className="col-span-3 text-center py-10">
              <p className="text-gray-500">No featured properties available at the moment.</p>
            </div>
          )}
        </div>
        
        <div className="text-center mt-10">
          <Link href="/properties">
            <Button variant="outline">
              View All Properties
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function FeaturedPropertySkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg">
      <div className="relative">
        <Skeleton className="w-full h-64" />
        <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full">
          <Skeleton className="w-16 h-6" />
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <Skeleton className="w-2/3 h-6" />
          <Skeleton className="w-1/4 h-6" />
        </div>
        <Skeleton className="w-full h-4 mt-2 mb-6" />
        <div className="flex justify-between">
          <Skeleton className="w-[30%] h-4" />
          <Skeleton className="w-[30%] h-4" />
          <Skeleton className="w-[30%] h-4" />
        </div>
      </div>
    </div>
  );
}
