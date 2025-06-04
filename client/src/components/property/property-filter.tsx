import React, { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Define constants for property types, subtypes, and furnishing options
const PROPERTY_TYPE_OPTIONS = ['apartment', 'independent-house', 'villa', 'farm-house', 'shop', 'basement'];
const FURNISHING_OPTIONS = ['furnished', 'semi-furnished', 'unfurnished'];
const PROPERTY_SUBTYPE_OPTIONS = ['1rk', '1bhk', '2bhk', '3bhk', '4bhk', 'plot', 'other'];
const FACING_OPTIONS = ['east', 'west', 'north', 'south', 'road', 'park', 'greenery'];
const PARKING_OPTIONS = ['car', 'two-wheeler', 'both', 'none'];

interface PropertyFilterProps {
  initialFilters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
}

export default function PropertyFilter({ initialFilters, onFilterChange }: PropertyFilterProps) {
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters };
    
    // Remove filter if value is empty string or undefined
    if (value === '' || value === undefined) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceRangeChange = (value: number[]) => {
    const newFilters = { ...filters };
    newFilters.minPrice = value[0];
    newFilters.maxPrice = value[1];
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleAreaRangeChange = (value: number[]) => {
    const newFilters = { ...filters };
    newFilters.minArea = value[0];
    newFilters.maxArea = value[1];
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleBedroomsChange = (value: string) => {
    handleFilterChange('bedrooms', value);
  };

  const handleBathroomsChange = (value: string) => {
    handleFilterChange('bathrooms', value);
  };

  const handleAgeChange = (value: string) => {
    handleFilterChange('age', value);
  };

  const handleLocationChange = (value: string) => {
    const newFilters = { ...filters };
    if (value === '') {
      delete newFilters.location;
    } else {
      newFilters.location = value;
    }
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePropertyTypeChange = (value: string) => {
    handleFilterChange('propertyType', value);
  };

  const handleSubTypeChange = (value: string) => {
    handleFilterChange('subType', value);
  };

  const handleFurnishedStatusChange = (value: string) => {
    handleFilterChange('furnishedStatus', value);
  };

  const handleFacingChange = (value: string) => {
    handleFilterChange('facing', value);
  };

  const handleParkingChange = (value: string) => {
    handleFilterChange('parking', value);
  };

  const handlePriceNegotiableChange = (checked: boolean) => {
    handleFilterChange('priceNegotiable', checked);
  };

  return (
    <div className="w-full max-w-md p-4 space-y-4">
      <Accordion type="multiple" defaultValue={["price", "area", "property-type"]}>
        {/* Price Range Filter */}
        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                min={0}
                max={100000000}
                step={100000}
                value={[filters.minPrice || 0, filters.maxPrice || 100000000]}
                onValueChange={handlePriceRangeChange}
              />
              <div className="flex justify-between text-sm">
                <span>₹{filters.minPrice?.toLocaleString() || 0}</span>
                <span>₹{filters.maxPrice?.toLocaleString() || '100 Cr+'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="price-negotiable"
                  checked={filters.priceNegotiable === 'true' || filters.priceNegotiable === true}
                  onCheckedChange={handlePriceNegotiableChange}
                />
                <Label htmlFor="price-negotiable">Price Negotiable</Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Area Range Filter */}
        <AccordionItem value="area">
          <AccordionTrigger>Area Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                min={0}
                max={10000}
                step={100}
                value={[filters.minArea || 0, filters.maxArea || 10000]}
                onValueChange={handleAreaRangeChange}
              />
              <div className="flex justify-between text-sm">
                <span>{filters.minArea || 0} sq ft</span>
                <span>{filters.maxArea || '10000+'} sq ft</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Property Type Filter */}
        <AccordionItem value="property-type">
          <AccordionTrigger>Property Type</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <Select value={filters.propertyType || ""} onValueChange={handlePropertyTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPE_OPTIONS.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Sub Type Filter */}
        <AccordionItem value="sub-type">
          <AccordionTrigger>Sub Type</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <Select value={filters.subType || ""} onValueChange={handleSubTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sub type" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_SUBTYPE_OPTIONS.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Furnished Status Filter */}
        <AccordionItem value="furnished">
          <AccordionTrigger>Furnished Status</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <Select value={filters.furnishedStatus || ""} onValueChange={handleFurnishedStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select furnished status" />
                </SelectTrigger>
                <SelectContent>
                  {FURNISHING_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Facing Filter */}
        <AccordionItem value="facing">
          <AccordionTrigger>Facing Direction</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <Select value={filters.facing || ""} onValueChange={handleFacingChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select facing direction" />
                </SelectTrigger>
                <SelectContent>
                  {FACING_OPTIONS.map((direction) => (
                    <SelectItem key={direction} value={direction}>
                      {direction.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Parking Filter */}
        <AccordionItem value="parking">
          <AccordionTrigger>Parking</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <Select value={filters.parking || ""} onValueChange={handleParkingChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select parking type" />
                </SelectTrigger>
                <SelectContent>
                  {PARKING_OPTIONS.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Bedrooms Filter */}
        <AccordionItem value="bedrooms">
          <AccordionTrigger>Bedrooms</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <Select value={filters.bedrooms || ""} onValueChange={handleBedroomsChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select number of bedrooms" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Bedroom' : 'Bedrooms'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Bathrooms Filter */}
        <AccordionItem value="bathrooms">
          <AccordionTrigger>Bathrooms</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <Select value={filters.bathrooms || ""} onValueChange={handleBathroomsChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select number of bathrooms" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Bathroom' : 'Bathrooms'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Age Filter */}
        <AccordionItem value="age">
          <AccordionTrigger>Age of Property</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <Select value={filters.age || ""} onValueChange={handleAgeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select age of property" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 10, 15, 20, 25, 30].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Year' : 'Years'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Location Filter */}
        <AccordionItem value="location">
          <AccordionTrigger>Location</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter location"
                value={filters.location || ''}
                onChange={(e) => handleLocationChange(e.target.value)}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setFilters({});
          onFilterChange({});
        }}
      >
        Clear All Filters
      </Button>
    </div>
  );
}
