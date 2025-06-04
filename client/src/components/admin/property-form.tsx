import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    insertPropertySchema,
    NearbyFacility,
    PropertyMedia,
    PropertyWithRelations
} from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Edit, FilmIcon, ImagePlus, Loader2, MapIcon, MapPin, Search, Shield, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { useLocation } from "wouter";
import { z } from "zod";
import { MapWithSSR } from './map-with-ssr';

// Custom marker icon to fix the missing marker issue
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

// Interface for POI (Point of Interest) returned from OSM
interface POI {
  id: number;
  name: string;
  distance: number; // in meters
  type: string;
  lat: number;
  lon: number;
}

// Helper function to generate generalized location information
const generateGeneralizedLocation = (lat: number, lon: number): string => {
  // Add random offset within 2km radius to protect exact location
  const radiusKm = 2;
  const randomAngle = Math.random() * 2 * Math.PI;
  const randomDistance = Math.random() * radiusKm;
  
  // Convert km to degrees (approximate)
  const deltaLat = (randomDistance * Math.cos(randomAngle)) / 111;
  const deltaLon = (randomDistance * Math.sin(randomAngle)) / (111 * Math.cos(lat * Math.PI / 180));
  
  const approxLat = lat + deltaLat;
  const approxLon = lon + deltaLon;
  
  // Generate area description based on coordinates
  const getAreaDescription = (latitude: number, longitude: number): string => {
    // South Delhi area mapping (approximate)
    if (latitude >= 28.5 && latitude <= 28.6) {
      if (longitude >= 77.15 && longitude <= 77.25) {
        return "South Delhi - Central Area";
      } else if (longitude >= 77.25 && longitude <= 77.35) {
        return "South Delhi - Eastern Sector";
      } else if (longitude >= 77.05 && longitude <= 77.15) {
        return "South Delhi - Western Zone";
      }
    }
    return "South Delhi - Premium Locality";
  };
  
  const areaDesc = getAreaDescription(approxLat, approxLon);
  
  return `📍 General Location: ${areaDesc}
🔒 Privacy Protected: Exact address shown to verified buyers only
📏 Approximate Area: Within 2km radius of actual location
📞 Contact: Through our verified agents only
🏢 Brokerage: South Delhi Realty - Licensed Real Estate Services
⚡ Fast Response: 24/7 customer support available
🔐 Secure Viewing: Property visits by appointment only`;
};

// Function to get nearby landmarks for general description
const getNearbyLandmarks = async (lat: number, lon: number): Promise<string[]> => {
  try {
    const radiusInMeters = 2000; // 2km radius
    const overpassQuery = `
      [out:json];
      (
        node["amenity"~"^(hospital|school|university|mall|park)$"](around:${radiusInMeters},${lat},${lon});
        way["amenity"~"^(hospital|school|university|mall|park)$"](around:${radiusInMeters},${lat},${lon});
      );
      out body;
    `;
    
    const response = await fetch(`https://overpass-api.de/api/interpreter`, {
      method: 'POST',
      body: overpassQuery
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    const landmarks = data.elements
      .filter((element: any) => element.tags?.name)
      .map((element: any) => element.tags.name)
      .slice(0, 3); // Limit to 3 landmarks
    
    return landmarks;
  } catch (error) {
    console.error('Error fetching landmarks:', error);
    return [];
  }
};

// MapLocationPicker component for interactive map
interface MapLocationPickerProps {
  defaultPosition?: [number, number];
  onPositionChange: (position: [number, number]) => void;
  onFetchFacilities: (facilities: POI[]) => void;
}

function MapLocationPicker({ defaultPosition = [28.5355, 77.2101], onPositionChange, onFetchFacilities }: MapLocationPickerProps) {
  const [position, setPosition] = useState<[number, number]>(defaultPosition);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchRadius, setSearchRadius] = useState<number>(1); // km
  
  // Function to handle marker position changes
  function LocationMarker() {
    const map = useMapEvents({
      click(e) {
        const newPosition: [number, number] = [e.latlng.lat, e.latlng.lng];
        setPosition(newPosition);
        onPositionChange(newPosition);
      },
    });

    return position ? (
      <Marker 
        position={position}
        draggable={true}
        eventHandlers={{
          dragend: (e) => {
            const marker = e.target;
            const newPosition: [number, number] = [marker.getLatLng().lat, marker.getLatLng().lng];
            setPosition(newPosition);
            onPositionChange(newPosition);
          },
        }}
      />
    ) : null;
  }

  // Function to fetch nearby facilities using OpenStreetMap Overpass API
  const fetchNearbyFacilities = async () => {
    setLoading(true);
    try {
      const [lat, lon] = position;
      const radiusInMeters = searchRadius * 1000;
      
      // OpenStreetMap Overpass API query for amenities
      const overpassQuery = `
        [out:json];
        (
          node["amenity"](around:${radiusInMeters},${lat},${lon});
          node["shop"](around:${radiusInMeters},${lat},${lon});
          node["leisure"](around:${radiusInMeters},${lat},${lon});
          node["education"](around:${radiusInMeters},${lat},${lon});
          node["healthcare"](around:${radiusInMeters},${lat},${lon});
        );
        out body;
      `;
      
      const response = await fetch(`https://overpass-api.de/api/interpreter`, {
        method: 'POST',
        body: overpassQuery
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch facilities from OpenStreetMap');
      }
      
      const data = await response.json();
      
      // Map OSM results to POI objects
      const facilities: POI[] = data.elements.map((element: any) => {
        // Calculate distance
        const facilityLat = element.lat;
        const facilityLon = element.lon;
        const distanceInMeters = calculateDistance(lat, lon, facilityLat, facilityLon);
        
        // Determine the type
        let type = 'other';
        if (element.tags) {
          if (element.tags.amenity === 'school' || element.tags.amenity === 'university' || element.tags.education) {
            type = 'school';
          } else if (element.tags.amenity === 'hospital' || element.tags.healthcare) {
            type = 'hospital';
          } else if (element.tags.shop) {
            type = 'shopping';
          } else if (element.tags.leisure || element.tags.amenity === 'park') {
            type = 'park';
          } else if (element.tags.amenity === 'restaurant' || element.tags.amenity === 'cafe') {
            type = 'restaurant';
          } else if (element.tags.amenity === 'bank') {
            type = 'bank';
          }
        }
        
        return {
          id: element.id,
          name: element.tags?.name || `${type.charAt(0).toUpperCase() + type.slice(1)} (Unnamed)`,
          distance: Math.round(distanceInMeters),
          type,
          lat: facilityLat,
          lon: facilityLon
        };
      });
      
      // Filter out duplicates and unnamed facilities
      const uniqueFacilities = facilities
        .filter(f => f.name && f.name.length > 3) // Filter out facilities with very short names
        .sort((a, b) => a.distance - b.distance); // Sort by distance
      
      onFetchFacilities(uniqueFacilities.slice(0, 20)); // Limit to 20 facilities
    } catch (error) {
      console.error('Error fetching nearby facilities:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Haversine formula to calculate distance between two coordinates in meters
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Label htmlFor="search-radius">Search Radius (km)</Label>
            <Input 
              id="search-radius"
              type="number" 
              min="0.1" 
              max="5" 
              step="0.1" 
              value={searchRadius}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setSearchRadius(isNaN(value) ? 1 : value);
              }}
              className="w-20"
            />
          </div>
          <div className="flex space-x-2">
            <Button
              type="button"
              onClick={fetchNearbyFacilities}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Fetching...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Find Nearby Facilities</span>
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              <span>Lat: {position[0].toFixed(6)}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              <span>Lng: {position[1].toFixed(6)}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="relative h-[400px] w-full rounded-md overflow-hidden border">
        <MapWithSSR>
          <MapContainer
            center={position}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker />
          </MapContainer>
        </MapWithSSR>
      </div>
    </div>
  );
}

// Extend the property schema with validation
const propertyFormSchema = insertPropertySchema.extend({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters.",
  }),
  contactDetails: z.string().min(10, {
    message: "Contact details must be at least 10 characters.",
  }),
  price: z.coerce.number().positive({
    message: "Price must be a positive number.",
  }),
  area: z.coerce.number().positive({
    message: "Area must be a positive number.",
  }),
  // Optional fields need custom validation
  bedrooms: z.coerce.number().optional(),
  bathrooms: z.coerce.number().optional(),
  balconies: z.coerce.number().optional(),
  age: z.coerce.number().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  // Handle date fields
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

interface PropertyFormProps {
  propertyId?: number;
}

export default function PropertyForm({ propertyId }: PropertyFormProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("details");
  const [uploadedMedia, setUploadedMedia] = useState<Array<{
    cloudinaryId: string;
    cloudinaryUrl: string;
    mediaType: string;
    isFeatured: boolean;
    orderIndex: number;
    id?: number;
    fileName?: string;
    processingStatus?: string;
    processingMessage?: string;
  }>>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [facilities, setFacilities] = useState<Array<{
    facilityName: string;
    distance: string;
    facilityType: string;
    id?: number;
  }>>([]);
  const [newFacility, setNewFacility] = useState({
    facilityName: "",
    distance: "",
    facilityType: "school"
  });
  // New state variables for map and nearby facilities
  const [mapPosition, setMapPosition] = useState<[number, number]>([28.5355, 77.2101]);
  const [foundFacilities, setFoundFacilities] = useState<POI[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<{ [key: number]: boolean }>({});
  const [showMapView, setShowMapView] = useState(false);
  const [contactDetailsMode, setContactDetailsMode] = useState<'manual' | 'auto'>('manual');

  // Define type for property types response
  type PropertyTypesResponse = {
    propertyTypes: string[];
    propertyCategories: string[];
    status: string[];
    subTypes: string[];
    portions: string[];
    areaUnits: string[];
    furnishedStatus: string[];
    facingOptions: string[];
    parkingOptions: string[];
    facilityTypes: string[];
  };
  
  // Fetch property types for form options
  const { data: propertyTypes = {} as PropertyTypesResponse } = useQuery<PropertyTypesResponse>({
    queryKey: ['/api/property-types'],
  });

  // Fetch property data if editing
  const { data: property, isPending: isPendingProperty } = useQuery<PropertyWithRelations>({
    queryKey: [`/api/admin/properties/${propertyId}`],
    enabled: !!propertyId,
  });

  // Form initialization
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: "",
      status: "sale",
      category: "residential",
      propertyType: "apartment",
      description: "",
      area: 0,
      areaUnit: "sq-ft",
      price: 0,
      priceNegotiable: false,
      contactDetails: "",
      isActive: true,
      slug: "", // Initialize slug field
    },
    // Ensure values are coerced to proper types
    shouldUseNativeValidation: false,
  });

  // Populate form when editing property
  useEffect(() => {
    if (property && propertyId) {
      // Convert null values to undefined and format for form
      const formattedProperty = {
        ...property,
        // Convert null values to undefined for optional fields
        bedrooms: property.bedrooms ?? undefined,
        bathrooms: property.bathrooms ?? undefined,
        balconies: property.balconies ?? undefined,
        age: property.age ?? undefined,
        brokerage: property.brokerage ?? undefined,
        latitude: property.latitude ?? undefined,
        longitude: property.longitude ?? undefined,
        subType: property.subType ?? undefined,
        portion: property.portion ?? undefined,
        furnishedStatus: property.furnishedStatus ?? undefined,
        facing: property.facing ?? undefined,
        parking: property.parking ?? undefined,
        // Ensure boolean fields are properly handled
        priceNegotiable: property.priceNegotiable === true,
        isActive: property.isActive === true
      };
      
      // Set form values with properly formatted data
      form.reset(formattedProperty);
      
      // Set map position if latitude and longitude exist
      if (property.latitude && property.longitude) {
        try {
          const lat = parseFloat(property.latitude);
          const lng = parseFloat(property.longitude);
          if (!isNaN(lat) && !isNaN(lng)) {
            setMapPosition([lat, lng]);
          }
        } catch (error) {
          console.error("Error parsing coordinates:", error);
        }
      }
      
      // Set media
      if (property.media && Array.isArray(property.media)) {
        setUploadedMedia(property.media.map((item: PropertyMedia) => ({
          id: item.id,
          cloudinaryId: item.cloudinaryId,
          cloudinaryUrl: item.cloudinaryUrl,
          mediaType: item.mediaType,
          isFeatured: Boolean(item.isFeatured),
          orderIndex: item.orderIndex || 0,
          fileName: item.fileName,
          processingStatus: item.processingStatus,
          processingMessage: item.processingMessage
        })));
      }
      
      // Set facilities
      if (property.facilities && Array.isArray(property.facilities)) {
        setFacilities(property.facilities.map((item: NearbyFacility) => ({
          id: item.id,
          facilityName: item.facilityName,
          distance: item.distance,
          facilityType: item.facilityType
        })));
      }
    }
  }, [property, propertyId, form]);

  // Handle map position changes
  const handleMapPositionChange = (position: [number, number]) => {
    setMapPosition(position);
    // Update form latitude and longitude fields
    const [lat, lng] = position;
    form.setValue('latitude', lat.toString());
    form.setValue('longitude', lng.toString());
  };

  // Handle nearby facilities fetching
  const handleFetchFacilities = (pois: POI[]) => {
    setFoundFacilities(pois);
    // Initialize selected state for all facilities
    const initialSelected: { [key: number]: boolean } = {};
    pois.forEach(poi => {
      initialSelected[poi.id] = false;
    });
    setSelectedFacilities(initialSelected);
    
    // Show success message
    toast({
      title: "Facilities found",
      description: `Found ${pois.length} nearby facilities`,
    });
    
    // Switch to facilities tab
    setSelectedTab("facilities");
  };

  // Add selected facilities to the property
  const addSelectedFacilities = () => {
    console.log("📍 addSelectedFacilities called");
    console.log("📍 Selected facilities:", selectedFacilities);
    console.log("📍 Found facilities:", foundFacilities);
    
    const facilitiesToAdd = foundFacilities
      .filter(poi => selectedFacilities[poi.id])
      .map(poi => ({
        facilityName: poi.name,
        distance: `${poi.distance}m`,
        facilityType: getStandardFacilityType(poi.type)
      }));
    
    console.log("📍 Facilities to add:", facilitiesToAdd);
    
    if (facilitiesToAdd.length === 0) {
      toast({
        title: "No facilities selected",
        description: "Please select at least one facility to add from the map results",
        variant: "destructive",
      });
      return;
    }
    
    setFacilities(prev => {
      const newFacilities = [...prev, ...facilitiesToAdd];
      console.log("📍 Updated facilities list:", newFacilities);
      return newFacilities;
    });
    
    // Reset selections
    const resetSelections: { [key: number]: boolean } = {};
    foundFacilities.forEach(poi => {
      resetSelections[poi.id] = false;
    });
    setSelectedFacilities(resetSelections);
    
    toast({
      title: "Facilities added successfully",
      description: `Added ${facilitiesToAdd.length} facility${facilitiesToAdd.length > 1 ? 'ies' : ''} from map results`,
    });
  };

  // Toggle facility selection
  const toggleFacilitySelection = (id: number) => {
    setSelectedFacilities(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Map OSM facility types to our standard types
  const getStandardFacilityType = (osmType: string): string => {
    switch (osmType) {
      case 'school': return 'school';
      case 'hospital': return 'hospital';
      case 'shopping': return 'shopping';
      case 'park': return 'park';
      case 'restaurant': return 'restaurant';
      case 'bank': return 'bank';
      default: return 'other';
    }
  };

  // Create a slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Remove consecutive hyphens
  };

  // Handle form submission
  function onSubmit(values: PropertyFormValues) {
    console.log("onSubmit called with values:", values);
    console.log("Current property ID:", propertyId);
    console.log("Uploaded media count:", uploadedMedia.length);
    console.log("Facilities count:", facilities.length);
    
    // Clean values to prevent date-related issues (toISOString errors)
    const cleanedValues = { ...values };
    
    // Generate slug for new properties if not present
    if (!propertyId && !cleanedValues.slug) {
      cleanedValues.slug = generateSlug(cleanedValues.title);
      console.log("Generated slug:", cleanedValues.slug);
    }
    
    // Ensure we don't have invalid date objects
    Object.keys(cleanedValues).forEach(key => {
      const value = (cleanedValues as any)[key];
      
      // Check if this looks like a date value but isn't a proper Date
      if (value && 
          typeof value === 'object' && 
          !(value instanceof Date) && 
          (value.hasOwnProperty('_isAMomentObject') || value.hasOwnProperty('_isValid'))
      ) {
        // Convert to string to avoid toISOString issues
        (cleanedValues as any)[key] = String(value);
      }
      
      // Ensure no null values for optional numeric fields to avoid conversion issues
      if (value === null && ['bedrooms', 'bathrooms', 'balconies', 'age'].includes(key)) {
        (cleanedValues as any)[key] = undefined;
      }
      
      // Ensure number fields remain as numbers, not strings
      if (['area', 'bedrooms', 'bathrooms', 'balconies', 'age', 'price'].includes(key) && 
          value !== undefined && value !== null) {
        const parsedValue = Number(value);
        if (!isNaN(parsedValue)) {
          (cleanedValues as any)[key] = parsedValue;
        }
      }
    });
    
    console.log("Sending cleaned values:", cleanedValues);
    
    if (propertyId) {
      console.log("Calling updatePropertyMutation...");
      updatePropertyMutation.mutate(cleanedValues);
    } else {
      console.log("Calling createPropertyMutation...");
      createPropertyMutation.mutate(cleanedValues);
    }
  }

  // Create property mutation
  const createPropertyMutation = useMutation({
    mutationFn: async (values: PropertyFormValues) => {
      console.log("createPropertyMutation - mutationFn started");
      console.log("Values being sent to server:", values);
      
      // Extra safety check for dates
      const safeValues = { ...values };
      
      // Remove createdAt and updatedAt to let server handle these
      delete (safeValues as any).createdAt;
      delete (safeValues as any).updatedAt;
      
      console.log("Sanitized values (removed dates):", safeValues);
      
      // Show a loading toast to indicate the process has started
      toast({
        title: "Creating property...",
        description: "Please wait while we save your data",
      });
      
      console.log("Sending POST request to /api/admin/properties");
      const res = await apiRequest("POST", "/api/admin/properties", safeValues);
      const data = await res.json();
      console.log("Response from property creation:", data);
      return data;
    },
    onSuccess: async (data) => {
      console.log("createPropertyMutation - onSuccess started");
      console.log("Property created with ID:", data.id);
      
      try {
        // Upload media for the new property
        if (uploadedMedia.length > 0) {
          console.log(`Processing ${uploadedMedia.length} media items for property ${data.id}`);
          for (const media of uploadedMedia) {
            console.log("Uploading media:", media);
            const mediaRes = await apiRequest("POST", `/api/admin/properties/${data.id}/media`, {
              cloudinaryId: media.cloudinaryId,
              cloudinaryUrl: media.cloudinaryUrl,
              mediaType: media.mediaType,
              isFeatured: media.isFeatured,
              orderIndex: media.orderIndex
            });
            const mediaData = await mediaRes.json();
            console.log("Media upload response:", mediaData);
          }
        }
        
        // Create facilities for the new property
        if (facilities.length > 0) {
          console.log(`Processing ${facilities.length} facilities for property ${data.id}`);
          for (const facility of facilities) {
            console.log("Adding facility:", facility);
            const facilityRes = await apiRequest("POST", `/api/admin/properties/${data.id}/facilities`, {
              facilityName: facility.facilityName,
              distance: facility.distance,
              facilityType: facility.facilityType
            });
            const facilityData = await facilityRes.json();
            console.log("Facility addition response:", facilityData);
          }
        }
        
        console.log("All property data saved successfully");
        toast({
          title: "Property created",
          description: "Property has been created successfully",
        });
        
        queryClient.invalidateQueries({ queryKey: ['/api/admin/properties'] });
        navigate("/admin/properties");
      } catch (error) {
        console.error("Error in creating related data:", error);
        toast({
          title: "Error saving related data",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      console.error("createPropertyMutation - onError:", error);
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update property mutation
  const updatePropertyMutation = useMutation({
    mutationFn: async (values: PropertyFormValues) => {
      console.log("updatePropertyMutation - mutationFn started");
      console.log("Values being sent to server:", values);
      console.log("PropertyId:", propertyId);
      
      // Extra safety check for dates
      const safeValues = { ...values };
      
      // Remove createdAt and updatedAt to let server handle these
      delete (safeValues as any).createdAt;
      delete (safeValues as any).updatedAt;
      
      console.log("Sanitized values (removed dates):", safeValues);
      
      // Show a loading toast to indicate the process has started
      toast({
        title: "Updating property...",
        description: "Please wait while we save your data",
      });
      
      console.log(`Sending PUT request to /api/admin/properties/${propertyId}`);
      const res = await apiRequest("PUT", `/api/admin/properties/${propertyId}`, safeValues);
      const data = await res.json();
      console.log("Response from property update:", data);
      return data;
    },
    onSuccess: async (data) => {
      console.log("updatePropertyMutation - onSuccess started");
      console.log("Property updated with ID:", propertyId);
      
      try {
        // Update media for the property
        if (uploadedMedia.length > 0) {
          // Find new media items that don't have an id yet
          const newMedia = uploadedMedia.filter(media => !media.id);
          console.log(`Found ${newMedia.length} new media items to upload`);
          
          for (const media of newMedia) {
            console.log("Uploading new media:", media);
            const mediaRes = await apiRequest("POST", `/api/admin/properties/${propertyId}/media`, {
              cloudinaryId: media.cloudinaryId,
              cloudinaryUrl: media.cloudinaryUrl,
              mediaType: media.mediaType,
              isFeatured: media.isFeatured,
              orderIndex: media.orderIndex
            });
            const mediaData = await mediaRes.json();
            console.log("Media upload response:", mediaData);
          }
        }
        
        // Update facilities for the property
        if (facilities.length > 0) {
          // Find new facilities that don't have an id yet
          const newFacilities = facilities.filter(facility => !facility.id);
          console.log(`Found ${newFacilities.length} new facilities to add`);
          
          for (const facility of newFacilities) {
            console.log("Adding new facility:", facility);
            const facilityRes = await apiRequest("POST", `/api/admin/properties/${propertyId}/facilities`, {
              facilityName: facility.facilityName,
              distance: facility.distance,
              facilityType: facility.facilityType
            });
            const facilityData = await facilityRes.json();
            console.log("Facility addition response:", facilityData);
          }
        }
        
        console.log("All property update data saved successfully");
        toast({
          title: "Property updated",
          description: "Property has been updated successfully",
        });
        
        queryClient.invalidateQueries({ queryKey: [`/api/admin/properties/${propertyId}`] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/properties'] });
        navigate("/admin/properties");
      } catch (error) {
        console.error("Error in updating related data:", error);
        toast({
          title: "Error saving related data",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      console.error("updatePropertyMutation - onError:", error);
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle media upload
  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    setUploadingMedia(true);
    
    const files = Array.from(event.target.files);
    const successfulUploads: any[] = [];
    const failedUploads: string[] = [];
    
    try {
      // Process files sequentially to avoid overwhelming the server
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          console.log(`📤 Uploading file ${i + 1}/${files.length}: ${file.name}`);
          
          // Check file size before upload (100MB limit)
          const maxSizeBytes = 100 * 1024 * 1024; // 100MB
          if (file.size > maxSizeBytes) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            throw new Error(`File too large: ${fileSizeMB}MB exceeds 100MB limit. Please compress your video or choose a smaller file.`);
          }
          
          // Check file type
          const isImage = file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/i);
          const isVideo = file.type.match(/^video\/(mp4|mov|avi|quicktime|x-msvideo|webm|x-matroska)$/i);
          
          if (!isImage && !isVideo) {
            throw new Error(`Unsupported file type: ${file.type}. Please use images (JPG, PNG, GIF, WebP) or videos (MP4, MOV, AVI, MKV, WebM).`);
          }
          
          // Convert file to base64
          const reader = new FileReader();
          const fileDataPromise = new Promise<string>((resolve, reject) => {
            reader.onload = () => {
              if (typeof reader.result === 'string') {
                resolve(reader.result);
              } else {
                reject(new Error('Failed to read file as data URL'));
              }
            };
            reader.onerror = () => reject(reader.error);
          });
          
          reader.readAsDataURL(file);
          const fileData = await fileDataPromise;
          
          // Get property ID for the upload
          const currentPropertyId = propertyId || 'temp';
          
          const response = await fetch('/api/admin/media/upload-watermarked', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fileData,
              fileName: file.name,
              propertyId: currentPropertyId,
              applyWatermark: true // Enable watermarking
            }),
            credentials: 'include'
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            
            // Handle specific error types with better user messages
            if (response.status === 413) {
              const sizeInfo = errorData.actualSizeMB ? ` (${errorData.actualSizeMB}MB)` : '';
              throw new Error(`File too large${sizeInfo}. Maximum size: ${errorData.maxSizeMB || 100}MB. Please compress your video or choose a smaller file.`);
            }
            
            if (response.status === 408) {
              throw new Error(`Upload timeout for ${file.name}. Large video files may take longer - try compressing the video or check your internet connection.`);
            }
            
            if (response.status === 400 && errorData.error === 'Unsupported file type') {
              throw new Error(`Unsupported file type: ${file.name}. Please use images (JPG, PNG, GIF, WebP) or videos (MP4, MOV, AVI, MKV, WebM).`);
            }
            
            // Generic error fallback
            const errorMessage = errorData.details || errorData.error || errorData.message || `Upload failed with status: ${response.status}`;
            throw new Error(errorMessage);
          }
          
          const data = await response.json();
          
          if (!data.cloudinaryId || !data.cloudinaryUrl) {
            throw new Error('Invalid response from server: missing required fields');
          }
          
          console.log(`✅ Upload successful for ${file.name}:`, data);
          
          // Add to successful uploads
          successfulUploads.push({
            cloudinaryId: data.cloudinaryId,
            cloudinaryUrl: data.cloudinaryUrl,
            mediaType: data.mediaType || (file.type.startsWith('video/') ? 'video' : 'image'),
            isFeatured: (uploadedMedia.length + successfulUploads.length) === 0, // First image is featured by default
            orderIndex: uploadedMedia.length + successfulUploads.length,
            fileName: file.name,
            // Store processing status for large videos
            processingStatus: data.processingStatus || 'complete',
            processingMessage: data.message
          });
          
        } catch (error) {
          console.error(`❌ Upload failed for ${file.name}:`, error);
          failedUploads.push(`${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      
      // Add all successful uploads to the media list
      if (successfulUploads.length > 0) {
        setUploadedMedia(prev => [...prev, ...successfulUploads]);
      }
      
      // Reset file input
      event.target.value = '';
      
      // Show success/error messages
      if (successfulUploads.length > 0) {
        const asyncVideos = successfulUploads.filter(upload => upload.processingStatus === 'async');
        const syncUploads = successfulUploads.filter(upload => upload.processingStatus !== 'async');
        
        if (asyncVideos.length > 0 && syncUploads.length === 0) {
          // All uploads are async videos
          toast({
            title: "Video uploaded successfully!",
            description: `${asyncVideos.length} video(s) uploaded. Watermarking is being processed in the background - you can continue using the videos.`,
          });
        } else if (asyncVideos.length > 0 && syncUploads.length > 0) {
          // Mixed uploads
          toast({
            title: "Upload completed",
            description: `${syncUploads.length} file(s) with watermark ready, ${asyncVideos.length} video(s) still processing watermark in background.`,
          });
        } else {
          // All uploads are complete/sync
          toast({
            title: "Upload completed",
            description: `${successfulUploads.length} file(s) uploaded successfully with SOUTH DELHI REALTY watermark`,
          });
        }
      }
      
      if (failedUploads.length > 0) {
        toast({
          title: "Some uploads failed",
          description: `${failedUploads.length} file(s) failed to upload. Check console for details.`,
          variant: "destructive",
        });
        console.error('Failed uploads:', failedUploads);
      }
      
    } catch (error) {
      console.error('Media upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setUploadingMedia(false);
    }
  };

  // Set featured media
  const setFeaturedMedia = (index: number) => {
    setUploadedMedia(prev => prev.map((item, i) => ({
      ...item,
      isFeatured: i === index
    })));
  };

  // Remove media
  const removeMedia = async (index: number) => {
    const mediaItem = uploadedMedia[index];
    
    if (!mediaItem) {
      console.error('❌ Media item not found at index:', index);
      toast({
        title: "Error",
        description: "Media item not found",
        variant: "destructive",
      });
      return;
    }
    
    console.log('🗑️ Attempting to remove media:', { index, mediaItem });
    console.log('🗑️ Media ID exists:', !!mediaItem.id);
    console.log('🗑️ All uploaded media IDs:', uploadedMedia.map(m => ({ id: m.id, cloudinaryId: m.cloudinaryId })));
    
    try {
      // If the media has an ID, it exists in the database and needs to be deleted from server
      if (mediaItem.id) {
        console.log(`🗑️ Deleting media with ID ${mediaItem.id} from server...`);
        
        const response = await fetch(`/api/admin/media/${mediaItem.id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          // Handle 404 specifically - media might have been deleted already
          if (response.status === 404) {
            console.log(`⚠️ Media ID ${mediaItem.id} not found on server (already deleted?)`);
            toast({
              title: "Media removed",
              description: "File was already removed from server",
            });
          } else {
            throw new Error(errorData.message || `Failed to delete media: ${response.status}`);
          }
        } else {
          console.log(`✅ Successfully deleted media ${mediaItem.id} from server and Cloudinary`);
          toast({
            title: "Media deleted",
            description: "File removed from server and cloud storage",
          });
        }
      } else {
        // If no ID, it's only in local state (not yet saved to server)
        console.log(`🗑️ Removing media from local state only (not saved to server yet)`);
        
        toast({
          title: "Media removed",
          description: "File removed from upload queue",
        });
      }
      
      // Remove from local state regardless of server result
      setUploadedMedia(prev => {
        const newMedia = prev.filter((_, i) => i !== index);
        console.log('🗑️ Updated media list:', newMedia.map(m => ({ id: m.id, cloudinaryId: m.cloudinaryId })));
        return newMedia;
      });
      
      // ✨ Invalidate React Query cache to refresh property data everywhere
      if (mediaItem.id && propertyId) {
        console.log('🔄 Invalidating cache for property data...');
        // Invalidate specific property data
        queryClient.invalidateQueries({
          queryKey: [`/api/admin/properties/${propertyId}`]
        });
        // Invalidate public property data (by slug)
        if (property?.slug) {
          queryClient.invalidateQueries({
            queryKey: [`/api/properties/${property.slug}`]
          });
        }
        // Invalidate all properties list
        queryClient.invalidateQueries({
          queryKey: ['/api/admin/properties']
        });
        queryClient.invalidateQueries({
          queryKey: ['/api/properties']
        });
        console.log('✅ Cache invalidation completed');
      }
      
    } catch (error) {
      console.error('❌ Error deleting media:', error);
      toast({
        title: "Deletion failed",
        description: error instanceof Error ? error.message : "Failed to delete media",
        variant: "destructive",
      });
    }
  };

  // Add a single facility manually
  const addFacility = () => {
    console.log("🟡 addFacility called for manual entry");
    console.log("🟡 newFacility state:", newFacility);
    console.log("🟡 facilityName:", newFacility.facilityName);
    console.log("🟡 distance:", newFacility.distance);
    
    // Only validate when manually adding a facility (not for map-selected facilities)
    if (!newFacility.facilityName.trim()) {
      console.log("🟡 Validation failed: missing facility name");
      toast({
        title: "Facility name required",
        description: "Please enter a facility name to add manually",
        variant: "destructive",
      });
      return;
    }
    
    // Add to facilities list
    setFacilities(prev => [...prev, { ...newFacility }]);
    setNewFacility({ facilityName: "", distance: "", facilityType: "school" });
    
    toast({
      title: "Facility added successfully",
      description: `Added ${newFacility.facilityName} to the nearby facilities`,
    });
  };

  // Remove facility
  const removeFacility = (index: number) => {
    setFacilities(prev => prev.filter((_, i) => i !== index));
  };

  // Debug function for button click
  const handleSubmitButtonClick = () => {
    console.log("📝 Property submit button clicked!");
    console.log("📋 Form values:", form.getValues());
    console.log("🔑 Property ID:", propertyId);
    console.log("🖼️ Media count:", uploadedMedia.length);
    console.log("🏢 Facilities count:", facilities.length);
    console.log("🔄 Form is valid:", form.formState.isValid);
    console.log("❌ Form errors:", form.formState.errors);
    
    // If form appears to be valid (no errors) but react-hook-form reports it as invalid, 
    // we'll manually submit to bypass this issue
    if (!form.formState.isValid && Object.keys(form.formState.errors).length === 0) {
      console.log("Form reports as invalid but has no errors. Manual submission triggered.");
      // Get values and manually submit
      const values = form.getValues();
      onSubmit(values);
    }
  };

  if (isPendingProperty && propertyId) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{propertyId ? "Edit Property" : "Add New Property"}</CardTitle>
        <CardDescription>
          {propertyId 
            ? "Update property information, media, and facilities" 
            : "Fill out the form to add a new property"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Property Details</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="facilities">Nearby Facilities</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <Form {...form}>
              <form 
                id="property-form" 
                onSubmit={(e) => {
                  console.log("📝 Form submit event triggered");
                  // Check if form is valid or has no errors
                  if (Object.keys(form.formState.errors).length === 0) {
                    // Let the react-hook-form handle the submission properly
                    form.handleSubmit(onSubmit)(e);
                  } else {
                    // Log errors if we have them
                    console.error("Form has validation errors:", form.formState.errors);
                    e.preventDefault();
                  }
                }} 
                className="space-y-6"
              >
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter property title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sale/Rent</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="sale">For Sale</SelectItem>
                              <SelectItem value="rent">For Rent</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="residential">Residential</SelectItem>
                              <SelectItem value="commercial">Commercial</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="propertyType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select property type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {propertyTypes?.propertyTypes?.map((type: string) => (
                                <SelectItem key={type} value={type}>
                                  {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="subType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sub Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select sub type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="not_specified">Not Specified</SelectItem>
                              {propertyTypes?.subTypes?.map((type: string) => (
                                <SelectItem key={type} value={type}>
                                  {type.toUpperCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the property" 
                            className="min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="area"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Area</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="areaUnit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Area Unit</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {propertyTypes?.areaUnits?.map((unit: string) => (
                                <SelectItem key={unit} value={unit}>
                                  {unit === "sq_ft" ? "Sq Feet" : unit === "sq_mt" ? "Sq Meter" : "Sq Yard"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="furnishedStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Furnished Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="not_specified">Not Specified</SelectItem>
                              {propertyTypes?.furnishedStatus?.map((status: string) => (
                                <SelectItem key={status} value={status}>
                                  {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bedrooms</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              value={field.value || ''} 
                              onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bathrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bathrooms</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              value={field.value || ''} 
                              onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="balconies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Balconies</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              value={field.value || ''} 
                              onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age (Years)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              value={field.value || ''} 
                              onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="facing"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facing Direction</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select direction" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="not_specified">Not Specified</SelectItem>
                              {propertyTypes?.facingOptions?.map((option: string) => (
                                <SelectItem key={option} value={option}>
                                  {option.replace(/\b\w/g, l => l.toUpperCase())}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="parking"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parking</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select parking option" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="not_specified">Not Specified</SelectItem>
                              {propertyTypes?.parkingOptions?.map((option: string) => (
                                <SelectItem key={option} value={option}>
                                  {option.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (₹)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="priceNegotiable"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-end space-x-2 space-y-0 pt-6">
                          <FormControl>
                            <Switch
                              checked={!!field.value}
                              onCheckedChange={(checked) => field.onChange(checked)}
                            />
                          </FormControl>
                          <FormLabel>Price Negotiable</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="brokerage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brokerage Information</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter brokerage details" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="contactDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Contact Details 
                          <Shield className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-blue-600 font-normal">Privacy Protected</span>
                        </FormLabel>
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant={contactDetailsMode === 'manual' ? "default" : "outline"}
                              size="sm"
                              onClick={() => setContactDetailsMode('manual')}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Manual Entry
                            </Button>
                            <Button
                              type="button"
                              variant={contactDetailsMode === 'auto' ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                setContactDetailsMode('auto');
                                const lat = parseFloat(form.getValues('latitude') || '28.5355');
                                const lon = parseFloat(form.getValues('longitude') || '77.2101');
                                const generalized = generateGeneralizedLocation(lat, lon);
                                form.setValue('contactDetails', generalized);
                              }}
                            >
                              <Shield className="h-4 w-4 mr-1" />
                              Auto-Generate (2km Privacy)
                            </Button>
                          </div>
                          
                          {contactDetailsMode === 'auto' && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                              <div className="flex items-start gap-2">
                                <Shield className="h-4 w-4 mt-0.5 text-blue-600" />
                                <div>
                                  <p className="font-medium">Privacy Protection Active</p>
                                  <p className="mt-1">Contact details are generalized within 2km radius. Exact location and contact information will only be shared with verified potential buyers through our secure system.</p>
                                  <ul className="mt-2 space-y-1 text-xs">
                                    <li>• Approximate location area only</li>
                                    <li>• Contact through licensed agents</li>
                                    <li>• Buyer verification required</li>
                                    <li>• Scheduled property visits only</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <FormControl>
                            <Textarea 
                              placeholder={contactDetailsMode === 'auto' 
                                ? "Auto-generated privacy-protected contact details will appear here..." 
                                : "Enter contact information and address"
                              } 
                              className="min-h-[120px]" 
                              {...field}
                              readOnly={contactDetailsMode === 'auto'}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitude</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 28.5355" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitude</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 77.2101" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="rounded-md border bg-gradient-to-r from-blue-50 to-green-50">
                    <div className="p-4 border-b bg-white/70">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-medium flex items-center">
                            📍 Location Map
                            <Badge variant="secondary" className="ml-2 text-xs">Find Nearby Facilities</Badge>
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Pin the exact location and automatically discover nearby facilities
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant={showMapView ? "secondary" : "default"}
                          onClick={() => setShowMapView(!showMapView)}
                          className="flex items-center space-x-2"
                        >
                          <MapIcon className="h-4 w-4" />
                          <span>{showMapView ? "Hide Map" : "Show Map & Find Facilities"}</span>
                        </Button>
                      </div>
                      {!showMapView && (
                        <div className="mt-3 p-3 bg-blue-100 rounded text-sm text-blue-800">
                          <p className="font-medium">💡 Pro tip:</p>
                          <p>Use the Location Map to automatically find nearby schools, hospitals, shopping centers, and more!</p>
                        </div>
                      )}
                    </div>
                    
                    {showMapView && (
                      <div className="p-4 bg-white">
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                          <p className="font-medium">📋 How to use the Location Map:</p>
                          <ol className="list-decimal list-inside mt-1 space-y-1">
                            <li>Click on the map to pin your property's exact location</li>
                            <li>Adjust the search radius and click "Find Nearby Facilities"</li>
                            <li>Go to the "Nearby Facilities" tab to add selected facilities</li>
                          </ol>
                        </div>
                        <MapLocationPicker
                          defaultPosition={mapPosition}
                          onPositionChange={handleMapPositionChange}
                          onFetchFacilities={handleFetchFacilities}
                        />
                      </div>
                    )}
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Switch
                            checked={!!field.value}
                            onCheckedChange={(checked) => field.onChange(checked)}
                          />
                        </FormControl>
                        <FormLabel>Active Property</FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="media">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Upload Media</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-500 text-white rounded-full p-1 mt-0.5">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-1">🎨 Enhanced Upload Features</h4>
                      <div className="text-blue-700 text-sm space-y-1">
                        <p>✅ Automatic watermarking for <strong>both images AND videos</strong> with "SOUTH DELHI REALTY" branding</p>
                        <p>✅ Support for images (JPG, PNG, GIF, WebP) and videos (MP4, MOV, AVI, MKV, WebM)</p>
                        <p>📊 File size limit: <strong>100MB per file</strong> (increased for video support)</p>
                        <p>🎬 All media files automatically branded with company watermark</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Label htmlFor="media-upload" className="cursor-pointer">
                    <div className="p-6 border-2 border-dashed rounded-lg flex flex-col items-center justify-center hover:bg-slate-50 hover:border-primary transition-colors">
                      <Upload className="h-10 w-10 mb-3 text-muted-foreground" />
                      <span className="text-base font-medium mb-1">Click to upload multiple files</span>
                      <span className="text-sm text-muted-foreground mb-2">Images & Videos supported</span>
                      <div className="flex items-center space-x-2 text-xs text-blue-600">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zM12 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V4zM12 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3z" clipRule="evenodd" />
                        </svg>
                        <span>Auto-watermarked with brand logo</span>
                      </div>
                    </div>
                    <input
                      id="media-upload"
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={handleMediaUpload}
                      disabled={uploadingMedia}
                    />
                  </Label>
                  {uploadingMedia && (
                    <div className="flex items-center bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                      <div>
                        <span className="font-medium text-yellow-800">Processing uploads...</span>
                        <p className="text-xs text-yellow-700 mt-1">Applying watermarks and uploading files</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Media Gallery</h3>
                {uploadedMedia.length === 0 ? (
                  <div className="p-12 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center">
                    <ImagePlus className="h-12 w-12 mb-3 text-muted-foreground" />
                    <p className="text-lg font-medium text-muted-foreground mb-1">No media uploaded yet</p>
                    <p className="text-sm text-muted-foreground">Upload images and videos to showcase your property</p>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4 text-sm text-muted-foreground">
                      {uploadedMedia.length} file(s) uploaded • All media files branded with SOUTH DELHI REALTY watermark
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {uploadedMedia.map((media, index) => (
                        <div key={index} className="relative border rounded-lg overflow-hidden group">
                          {media.mediaType === 'image' ? (
                            <div className="relative">
                              <img
                                src={media.cloudinaryUrl}
                                alt={`Property image ${index + 1}`}
                                className="w-full h-40 object-cover"
                              />
                              <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                <svg className="h-3 w-3 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" clipRule="evenodd" />
                                </svg>
                                Watermarked
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-40 bg-black flex items-center justify-center relative">
                              <FilmIcon className="h-12 w-12 text-white" />
                              {media.processingStatus === 'async' ? (
                                <div className="absolute bottom-1 right-1 bg-yellow-600 text-white text-xs px-2 py-1 rounded flex items-center">
                                  <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1"></div>
                                  Processing...
                                </div>
                              ) : (
                                <div className="absolute bottom-1 right-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                  <svg className="h-3 w-3 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" clipRule="evenodd" />
                                  </svg>
                                  Watermarked Video
                                </div>
                              )}
                            </div>
                          )}
                          <div className="p-3 bg-white border-t">
                            <div className="flex justify-between items-center mb-2">
                              <button
                                type="button"
                                onClick={() => setFeaturedMedia(index)}
                                className={`text-xs px-2 py-1 rounded-full transition-colors ${
                                  media.isFeatured 
                                    ? 'bg-primary text-white font-medium' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {media.isFeatured ? '⭐ Featured' : 'Set featured'}
                              </button>
                              <button
                                type="button"
                                onClick={() => removeMedia(index)}
                                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            {media.fileName && (
                              <p className="text-xs text-muted-foreground truncate" title={media.fileName}>
                                {media.fileName}
                              </p>
                            )}
                            {media.processingStatus === 'async' && media.processingMessage && (
                              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                                <p className="font-medium">⏳ Background Processing</p>
                                <p>{media.processingMessage}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="facilities">
            <div className="space-y-6">
              {foundFacilities.length > 0 && (
                <div className="border-b pb-6 mb-6 bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-medium">📍 Facilities Found on Map</h3>
                      <p className="text-sm text-blue-600 mt-1">
                        Found {foundFacilities.length} facilities near your property location
                      </p>
                    </div>
                    <Button 
                      type="button" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("🔵 Add Selected button clicked");
                        console.log("🔵 Event:", e);
                        addSelectedFacilities();
                      }}
                      variant="default"
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                      disabled={Object.values(selectedFacilities).filter(Boolean).length === 0}
                    >
                      <span>Add Selected ({Object.values(selectedFacilities).filter(Boolean).length})</span>
                    </Button>
                  </div>
                  <div className="border rounded-md overflow-hidden bg-white">
                    <table className="w-full">
                      <thead className="bg-blue-100">
                        <tr>
                          <th className="p-2 text-left w-12">
                            <div className="flex items-center justify-center">
                              <input
                                type="checkbox"
                                checked={foundFacilities.length > 0 && foundFacilities.every(f => selectedFacilities[f.id])}
                                onChange={(e) => {
                                  const newSelections: { [key: number]: boolean } = {};
                                  foundFacilities.forEach(facility => {
                                    newSelections[facility.id] = e.target.checked;
                                  });
                                  setSelectedFacilities(newSelections);
                                }}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            </div>
                          </th>
                          <th className="p-2 text-left">Name</th>
                          <th className="p-2 text-left">Distance</th>
                          <th className="p-2 text-left">Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {foundFacilities.map((facility) => (
                          <tr key={facility.id} className="border-t hover:bg-blue-50">
                            <td className="p-2">
                              <div className="flex items-center justify-center">
                                <input
                                  type="checkbox"
                                  checked={!!selectedFacilities[facility.id]}
                                  onChange={() => toggleFacilitySelection(facility.id)}
                                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                              </div>
                            </td>
                            <td className="p-2">{facility.name}</td>
                            <td className="p-2">{facility.distance}m</td>
                            <td className="p-2">
                              <Badge variant="secondary">
                                {facility.type.charAt(0).toUpperCase() + facility.type.slice(1)}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3 p-3 bg-blue-100 rounded text-sm text-blue-800">
                    <p className="font-medium">💡 How to use:</p>
                    <ol className="list-decimal list-inside mt-1 space-y-1">
                      <li>Select the facilities you want to add by checking the boxes</li>
                      <li>Click "Add Selected" button to add them to your property</li>
                      <li>The facilities will appear in the "Nearby Facilities" list below</li>
                    </ol>
                  </div>
                </div>
              )}
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  ✏️ Add Facility Manually
                  <Badge variant="outline" className="ml-2 text-xs">Optional</Badge>
                </h3>
                <div className="mb-4 text-sm text-gray-600">
                  <p>📝 Enter facility details manually if not found on the map or for custom facilities.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label htmlFor="facility-name" className="text-sm font-medium">
                      Facility Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="facility-name"
                      placeholder="e.g. ABC School"
                      value={newFacility.facilityName}
                      onChange={(e) => setNewFacility(prev => ({ ...prev, facilityName: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="facility-distance" className="text-sm font-medium">
                      Distance <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="facility-distance"
                      placeholder="e.g. 500m"
                      value={newFacility.distance}
                      onChange={(e) => setNewFacility(prev => ({ ...prev, distance: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="facility-type" className="text-sm font-medium">Type</Label>
                    <Select
                      value={newFacility.facilityType}
                      onValueChange={(value) => setNewFacility(prev => ({ ...prev, facilityType: value }))}
                    >
                      <SelectTrigger id="facility-type" className="mt-1">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {propertyTypes?.facilityTypes?.map((type: string) => (
                          <SelectItem key={type} value={type}>
                            {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    <span className="text-red-500">*</span> Required fields for manual entry only
                  </p>
                  <Button 
                    type="button" 
                    onClick={addFacility}
                    disabled={!newFacility.facilityName.trim() || !newFacility.distance.trim()}
                    className="ml-auto"
                  >
                    Add Manual Facility
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center justify-between">
                  <span>Nearby Facilities</span>
                  <Badge variant="secondary">{facilities.length} added</Badge>
                </h3>
                {facilities.length === 0 ? (
                  <div className="p-8 border border-dashed rounded-md flex flex-col items-center justify-center">
                    <p className="text-muted-foreground">No facilities added yet</p>
                    <div className="mt-4 flex flex-col items-center space-y-2">
                      <Button 
                        variant="link" 
                        onClick={() => {
                          setSelectedTab("details");
                          setShowMapView(true);
                        }}
                        className="text-blue-600"
                      >
                        📍 Use the map to find nearby facilities
                      </Button>
                      <span className="text-sm text-gray-400">or add them manually above</span>
                    </div>
                  </div>
                ) : (
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="p-2 text-left">Name</th>
                          <th className="p-2 text-left">Distance</th>
                          <th className="p-2 text-left">Type</th>
                          <th className="p-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {facilities.map((facility, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-2">{facility.facilityName}</td>
                            <td className="p-2">{facility.distance}</td>
                            <td className="p-2">
                              <Badge variant="outline">
                                {facility.facilityType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFacility(index)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 h-auto"
                              >
                                Remove
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t p-6 flex justify-between">
        <Button variant="outline" onClick={() => navigate("/admin/properties")}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          form="property-form" 
          disabled={createPropertyMutation.isPending || updatePropertyMutation.isPending}
          onClick={handleSubmitButtonClick}
        >
          {createPropertyMutation.isPending || updatePropertyMutation.isPending
            ? "Saving..."
            : propertyId ? "Update Property" : "Create Property"}
        </Button>
      </CardFooter>
    </Card>
  );
}
