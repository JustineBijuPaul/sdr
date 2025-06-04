import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import PropertyCard from "@/components/properties/property-card";
import PropertyFiltersComponent, { PropertyFilters } from "@/components/properties/property-filters";
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

  const [filters, setFilters] = useState<PropertyFilters>(filtersFromUrl);

  // Build the API URL with all filter parameters
  const buildApiUrl = (pageNum: number = currentPage, filterParams: PropertyFilters = filters) => {
    const params = new URLSearchParams();
    params.set('page', pageNum.toString());
    params.set('include', 'media');
    
    // Add all filter parameters
    Object.entries(filterParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value.toString());
      }
    });
    
    return `/api/properties?${params.toString()}`;
  };

  // Update URL when filters change
  const updateUrl = (newFilters: PropertyFilters, pageNum: number = 1) => {
    const params = new URLSearchParams();
    
    if (pageNum > 1) {
      params.set('page', pageNum.toString());
    }
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const newPath = queryString ? `/properties?${queryString}` : '/properties';
    navigate(newPath, { replace: true });
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: PropertyFilters) => {
    setFilters(newFilters);
    updateUrl(newFilters, 1); // Reset to page 1 when filters change
    setShowMobileFilters(false);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    const emptyFilters: PropertyFilters = {};
    setFilters(emptyFilters);
    updateUrl(emptyFilters, 1);
    setShowMobileFilters(false);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    updateUrl(filters, newPage);
  };

  // Create a cache key that includes all filter parameters
  const createCacheKey = () => {
    const filterString = Object.entries(filters)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${key}:${value}`)
      .join('|');
    return `properties-page-${currentPage}-${filterString}`;
  };
  
  // Fetch properties data
  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey: [createCacheKey()],
    queryFn: async () => {
      const apiUrl = buildApiUrl(currentPage, filters);
      
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Error fetching properties: ${response.status}`);
        }
        const data = await response.json();
        
        if (!data || !Array.isArray(data.properties)) {
          console.error("Invalid API response structure:", data);
        }
        
        return data;
      } catch (error) {
        console.error("Error fetching properties:", error);
        throw error;
      }
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });
  
  const properties = data?.properties || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };
  
  // Normalize pagination to use consistent property names
  const normalizedPagination = {
    ...pagination,
    pages: pagination.totalPages || 1
  };

  // Get active filter count for display
  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== null && value !== ''
    ).length;
  };
  
  // Render pagination items
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(normalizedPagination.pages, startPage + maxVisiblePages - 1);
    
    // Previous button
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (currentPage > 1) {
              handlePageChange(currentPage - 1);
            }
          }}
          className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
        />
      </PaginationItem>
    );
    
    // First page
    if (startPage > 1) {
      items.push(
        <PaginationItem key="1">
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
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(i);
            }}
            isActive={i === currentPage}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Last page
    if (endPage < normalizedPagination.pages) {
      if (endPage < normalizedPagination.pages - 1) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      items.push(
        <PaginationItem key={normalizedPagination.pages}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(normalizedPagination.pages);
            }}
          >
            {normalizedPagination.pages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Next button
    items.push(
      <PaginationItem key="next">
        <PaginationNext
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (currentPage < normalizedPagination.pages) {
              handlePageChange(currentPage + 1);
            }
          }}
          className={currentPage === normalizedPagination.pages ? 'pointer-events-none opacity-50' : ''}
        />
      </PaginationItem>
    );
    
    return items;
  };
  
  return (
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
  );
}
