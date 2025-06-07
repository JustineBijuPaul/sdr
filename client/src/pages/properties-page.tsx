import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import PropertyCard from "@/components/properties/property-card";
import PropertyFiltersComponent, { PropertyFilters } from "@/components/properties/property-filters";
import SEOHead from "@/components/seo/seo-head";
import { Button } from "@/components/ui/button";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertyWithRelations } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import {
    SlidersHorizontal
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

// Define a proper API response type
interface ApiResponse {
  properties?: PropertyWithRelations[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  [key: string]: any;
}

export default function PropertiesPage() {
  const [location, navigate] = useLocation();
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Parse URL query parameters
  const searchParams = location.includes('?') 
    ? new URLSearchParams(location.split('?')[1]) 
    : new URLSearchParams();
    
  // Get current page from URL
  const currentPage = parseInt(searchParams.get('page') || '1');
  
  // Extract filters from URL
  const filtersFromUrl: PropertyFilters = {
    search: searchParams.get('search') || undefined,
    status: searchParams.get('status') || undefined,
    category: searchParams.get('category') || undefined,
    propertyType: searchParams.get('propertyType') || undefined,
    subType: searchParams.get('subType') || undefined,
    minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
    minArea: searchParams.get('minArea') ? parseInt(searchParams.get('minArea')!) : undefined,
    maxArea: searchParams.get('maxArea') ? parseInt(searchParams.get('maxArea')!) : undefined,
    bedrooms: searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!) : undefined,
    bathrooms: searchParams.get('bathrooms') ? parseInt(searchParams.get('bathrooms')!) : undefined,
    furnishedStatus: searchParams.get('furnishedStatus') || undefined,
    parking: searchParams.get('parking') || undefined,
    facing: searchParams.get('facing') || undefined,
  };

  // Set initial filters from URL
  if (Object.keys(filters).length === 0) {
    setFilters(filtersFromUrl);
  }

  // Build API URL with filters and pagination
  const buildApiUrl = (pageNum: number = currentPage, filterParams: PropertyFilters = filters) => {
    const params = new URLSearchParams();
    params.append('page', pageNum.toString());
    params.append('limit', '12');
    
    Object.entries(filterParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    return `/api/properties?${params.toString()}`;
  };

  // Update URL when filters change
  const updateUrl = (newFilters: PropertyFilters, pageNum: number = 1) => {
    const params = new URLSearchParams();
    
    if (pageNum > 1) {
      params.append('page', pageNum.toString());
    }
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const newUrl = params.toString() ? `/properties?${params.toString()}` : '/properties';
    navigate(newUrl);
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: PropertyFilters) => {
    setFilters(newFilters);
    updateUrl(newFilters, 1);
    setShowMobileFilters(false);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({});
    navigate('/properties');
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    updateUrl(filters, newPage);
  };

  // Create cache key for React Query
  const createCacheKey = () => {
    return buildApiUrl();
  };
  
  // Fetch properties data
  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey: [createCacheKey()],
    queryFn: async () => {
      const response = await fetch(buildApiUrl());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
  });
  
  const properties = data?.properties || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };
  
  // Normalize pagination data
  const normalizedPagination = {
    total: pagination.total || 0,
    page: pagination.page || currentPage,
    limit: pagination.limit || 12,
    pages: pagination.totalPages || Math.ceil((pagination.total || 0) / (pagination.limit || 12))
  };

  // Get count of active filters
  const getActiveFilterCount = () => {
    return Object.values(filtersFromUrl).filter(value => 
      value !== undefined && value !== null && value !== ''
    ).length;
  };

  // Render pagination items
  const renderPaginationItems = () => {
    const items = [];
    const currentPage = normalizedPagination.page;
    const totalPages = normalizedPagination.pages;
    
    // Previous button
    if (currentPage > 1) {
      items.push(
        <PaginationItem key="prev">
          <PaginationPrevious 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(currentPage - 1);
            }}
          />
        </PaginationItem>
      );
    }
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(1);
            }}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            isActive={i === currentPage}
            onClick={(e) => {
              e.preventDefault();
              if (i !== currentPage) {
                handlePageChange(i);
              }
            }}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(totalPages);
            }}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Next button
    if (currentPage < totalPages) {
      items.push(
        <PaginationItem key="next">
          <PaginationNext 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(currentPage + 1);
            }}
          />
        </PaginationItem>
      );
    }
    
    return items;
  };

  // Generate dynamic SEO based on current filters
  const generateSEOData = () => {
    const type = searchParams.get('type');
    const location = searchParams.get('location');
    const status = searchParams.get('status');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    let title = 'Properties in South Delhi';
    let description = 'Browse premium real estate properties in South Delhi. Find your perfect home or investment opportunity.';
    let keywords = 'south delhi properties, real estate south delhi';

    // Customize based on filters
    if (type) {
      const typeFormatted = type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
      title = `${typeFormatted} Properties in South Delhi`;
      description = `Find ${typeFormatted.toLowerCase()} properties in South Delhi. Premium ${typeFormatted.toLowerCase()} listings with photos, prices, and details.`;
      keywords += `, ${type} south delhi, ${typeFormatted.toLowerCase()} properties`;
    }

    if (location) {
      const locationFormatted = location.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
      title = `Properties in ${locationFormatted}, South Delhi`;
      description = `Discover premium properties in ${locationFormatted}, South Delhi. Best deals on residential and commercial properties.`;
      keywords += `, ${location} properties, real estate ${locationFormatted}`;
    }

    if (status) {
      const statusText = status === 'sale' ? 'Sale' : 'Rent';
      title = `Properties for ${statusText} in South Delhi`;
      description = `Find properties for ${statusText.toLowerCase()} in South Delhi. Best ${statusText.toLowerCase()} deals with verified listings.`;
      keywords += `, ${status} properties south delhi, property ${status}`;
    }

    if (minPrice && maxPrice) {
      const priceRange = `₹${minPrice} - ₹${maxPrice}`;
      title += ` | ${priceRange}`;
      description += ` Price range: ${priceRange}.`;
    }

    return {
      title,
      description: description.length > 160 ? description.substring(0, 157) + '...' : description,
      keywords,
      url: `https://southdelhirealty.com/properties${window.location.search}`
    };
  };

  const seoData = generateSEOData();

  return (
    <>
      <SEOHead
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        url={seoData.url}
        type="website"
      />
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow py-8">
          <div className="container mx-auto px-4">
            {/* Page title and mobile filter button */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Properties</h1>
                {normalizedPagination.total > 0 && (
                  <p className="text-muted-foreground">
                    {getActiveFilterCount() > 0 ? 
                      `${normalizedPagination.total} filtered results` : 
                      `${normalizedPagination.total} properties available`
                    }
                  </p>
                )}
              </div>
              
              {/* Mobile Filter Button */}
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="md:hidden">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                      {getActiveFilterCount() > 0 && (
                        <span className="ml-2 bg-primary text-primary-foreground rounded-full text-xs px-2 py-1">
                          {getActiveFilterCount()}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-full sm:w-[400px] overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filter Properties</SheetTitle>
                      <SheetDescription>
                        Refine your search to find the perfect property
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                      <PropertyFiltersComponent
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        onClearFilters={handleClearFilters}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Desktop Filters Sidebar */}
              <div className="hidden md:block xl:col-span-1">
                <div className="sticky top-8">
                  <PropertyFiltersComponent
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onClearFilters={handleClearFilters}
                  />
                </div>
              </div>
              
              {/* Properties Grid */}
              <div className="xl:col-span-3 w-full">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((_, index) => (
                      <Skeleton key={index} className="h-[300px] w-full" />
                    ))}
                  </div>
                ) : (
                  <>
                    {properties.length > 0 ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {properties.map((property: PropertyWithRelations) => (
                            <PropertyCard 
                              key={property.id} 
                              property={property} 
                            />
                          ))}
                        </div>
                        
                        {/* Pagination */}
                        {normalizedPagination.pages > 1 && (
                          <div className="mt-8">
                            <Pagination>
                              <PaginationContent>
                                {renderPaginationItems()}
                              </PaginationContent>
                            </Pagination>
                            <div className="text-center text-sm text-muted-foreground mt-2">
                              Showing {properties.length} of {normalizedPagination.total} properties
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p-12 text-center border rounded-lg bg-muted/10">
                        <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
                        <p className="text-muted-foreground mb-4">
                          We couldn't find any properties matching your criteria.
                        </p>
                        {getActiveFilterCount() > 0 && (
                          <Button onClick={handleClearFilters} variant="outline">
                            Clear all filters
                          </Button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
