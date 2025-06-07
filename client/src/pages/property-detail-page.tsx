import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import PropertyGallery from "@/components/properties/property-gallery";
import SEOHead, { generatePropertyStructuredData } from "@/components/seo/seo-head";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatIndianRupees } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { PropertyWithRelations, insertInquirySchema } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    ArrowLeftRight,
    Bath,
    Bed,
    CalendarIcon,
    Heart,
    MapPin,
    Share2
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useParams } from "wouter";
import { z } from "zod";

// Extended inquiry schema with validation
const propertyInquirySchema = insertInquirySchema.extend({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
});

type PropertyInquiryValues = z.infer<typeof propertyInquirySchema>;

export default function PropertyDetailPage() {
  const { slug } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Fetch property details
  const { data: property, isLoading, error } = useQuery<PropertyWithRelations>({
    queryKey: [`/api/properties/${slug}`],
  });

  // Form for inquiry submission
  const form = useForm<PropertyInquiryValues>({
    resolver: zodResolver(propertyInquirySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: `I'm interested in this property. Please contact me with more information.`,
    },
  });

  // Inquiry submission mutation
  const submitInquiryMutation = useMutation({
    mutationFn: async (values: PropertyInquiryValues) => {
      const inquiryData = {
        ...values,
        propertyId: property?.id
      };
      const res = await apiRequest("POST", "/api/inquiries", inquiryData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Inquiry submitted",
        description: "We will get back to you soon!",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: PropertyInquiryValues) {
    submitInquiryMutation.mutate(values);
  }

  // If property not found
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-3xl font-bold mb-4">Property Not Found</h1>
            <p className="mb-6">The property you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate("/properties")}>
              Browse Properties
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Loading state
  if (isLoading || !property) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-8">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <Skeleton className="h-96 w-full rounded-lg" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Skeleton className="h-10 w-3/4 mb-4" />
                <Skeleton className="h-6 w-1/2 mb-6" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-8" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[1, 2, 3, 4].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
                <Skeleton className="h-6 w-1/3 mb-4" />
                <Skeleton className="h-40 w-full" />
              </div>
              <div>
                <Skeleton className="h-80 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Format property details
  const statusLabel = property.status === 'sale' ? 'For Sale' : 'For Rent';
  const statusClass = property.status === 'sale' ? 'bg-primary' : 'bg-green-500';
  
  const formatPrice = () => {
    let price = formatIndianRupees(property.price);
    if (property.status === 'rent') {
      price += '/month';
    }
    return price;
  };
  
  const getAreaWithUnit = () => {
    const units: Record<string, string> = {
      sq_ft: 'sq.ft',
      sq_mt: 'sq.mt',
      sq_yd: 'sq.yd'
    };
    return `${property.area} ${units[property.areaUnit]}`;
  };

  const formatPropertyType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Generate SEO data for property
  const generateSEOData = () => {
    if (!property) return {};

    const propertyTitle = `${property.title} in South Delhi`;
    const propertyDescription = `${property.description?.substring(0, 160)}... ${formatPrice()} | ${property.bedrooms} BHK | ${getAreaWithUnit()} | ${property.location || 'South Delhi'}`;
    const propertyImage = property.media?.[0]?.cloudinaryUrl || '/sdrlogo.png';
    const propertyUrl = `https://southdelhirealty.com/property/${property.slug}`;
    
    const keywords = [
      `${property.bedrooms} bhk ${property.type} south delhi`,
      `${property.location || ''} properties`,
      `${property.status} ${property.type}`,
      property.status === 'sale' ? 'buy property south delhi' : 'rent property south delhi',
      'south delhi real estate',
      'premium properties south delhi'
    ].filter(Boolean).join(', ');

    return {
      title: propertyTitle,
      description: propertyDescription,
      keywords,
      image: propertyImage,
      url: propertyUrl,
      structuredData: generatePropertyStructuredData(property)
    };
  };

  const seoData = generateSEOData();

  return (
    <>
      {property && (
        <SEOHead
          title={seoData.title}
          description={seoData.description}
          keywords={seoData.keywords}
          image={seoData.image}
          url={seoData.url}
          type="article"
          structuredData={seoData.structuredData}
        />
      )}
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow py-8">
          <div className="container mx-auto px-4">
            {/* Breadcrumb */}
            <div className="text-sm mb-4 text-muted-foreground">
              <a href="/" className="hover:text-primary">Home</a> {" / "}
              <a href="/properties" className="hover:text-primary">Properties</a> {" / "}
              <span>{property.title}</span>
            </div>
            
            {/* Property Gallery */}
            <PropertyGallery media={property.media || []} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Property Details */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                      <p className="text-muted-foreground flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {property.contactDetails.split(',')[0]}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={statusClass}>{statusLabel}</Badge>
                      <p className="text-2xl font-bold text-primary mt-2">{formatPrice()}</p>
                      {property.priceNegotiable && (
                        <span className="text-sm text-muted-foreground">Negotiable</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 my-6">
                    {property.bedrooms && (
                      <div className="flex items-center">
                        <Bed className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span>{property.bedrooms} Bedrooms</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center">
                        <Bath className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span>{property.bathrooms} Bathrooms</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <ArrowLeftRight className="h-5 w-5 mr-2 text-muted-foreground" />
                      <span>{getAreaWithUnit()}</span>
                    </div>
                    {property.furnishedStatus && (
                      <div className="flex items-center">
                        <CalendarIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span>
                          {property.furnishedStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                {/* Property Features */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">Property Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-muted-foreground">Property Type</span>
                      <span className="font-medium">{formatPropertyType(property.propertyType)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-muted-foreground">Category</span>
                      <span className="font-medium">
                        {property.category === 'residential' ? 'Residential' : 'Commercial'}
                      </span>
                    </div>
                    {property.subType && (
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-muted-foreground">Sub Type</span>
                        <span className="font-medium">{property.subType.toUpperCase()}</span>
                      </div>
                    )}
                    {property.portion && (
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-muted-foreground">Portion</span>
                        <span className="font-medium">
                          {property.portion.replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-muted-foreground">Area</span>
                      <span className="font-medium">{getAreaWithUnit()}</span>
                    </div>
                    {property.bedrooms && (
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-muted-foreground">Bedrooms</span>
                        <span className="font-medium">{property.bedrooms}</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-muted-foreground">Bathrooms</span>
                        <span className="font-medium">{property.bathrooms}</span>
                      </div>
                    )}
                    {property.balconies && (
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-muted-foreground">Balconies</span>
                        <span className="font-medium">{property.balconies}</span>
                      </div>
                    )}
                    {property.facing && (
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-muted-foreground">Facing</span>
                        <span className="font-medium">
                          {property.facing.replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    )}
                    {property.parking && (
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-muted-foreground">Parking</span>
                        <span className="font-medium">
                          {property.parking.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    )}
                    {property.age && (
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-muted-foreground">Age of Property</span>
                        <span className="font-medium">{property.age} years</span>
                      </div>
                    )}
                    {property.furnishedStatus && (
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-muted-foreground">Furnished Status</span>
                        <span className="font-medium">
                          {property.furnishedStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Nearby Facilities */}
                {property.facilities && property.facilities.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold mb-4">Nearby Facilities</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {property.facilities.map((facility, index) => (
                          <div key={index} className="flex items-center justify-between py-2 border-b">
                            <span className="text-muted-foreground">
                              {facility.facilityType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            <span className="font-medium">
                              {facility.facilityName} ({facility.distance})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                
                <Separator className="my-6" />
                
                {/* Description */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">Description</h2>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-line">{property.description}</p>
                  </div>
                </div>
                
                {/* Share & Favorite */}
                <div className="flex flex-wrap gap-4 my-6">
                  <Button variant="outline" onClick={() => navigator.clipboard.writeText(window.location.href)}>
                    <Share2 className="h-4 w-4 mr-2" /> Share
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={isFavorite ? "text-red-500 border-red-500" : ""}
                  >
                    <Heart 
                      className={`h-4 w-4 mr-2 ${isFavorite ? "fill-red-500" : ""}`} 
                    /> 
                    {isFavorite ? "Saved" : "Add to Favorites"}
                  </Button>
                </div>
              </div>
              
              {/* Contact Form */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Interested in this property?</CardTitle>
                    <CardDescription>Fill out the form below and we'll get back to you soon.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input placeholder="Your email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Your phone number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Your message" 
                                  className="min-h-[120px]" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={submitInquiryMutation.isPending}
                        >
                          {submitInquiryMutation.isPending ? "Sending..." : "Send Inquiry"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter className="flex-col items-stretch space-y-2 border-t pt-6">
                    <p className="text-sm text-center text-muted-foreground mb-4">
                      Or contact us directly:
                    </p>
                    <Button variant="outline" className="w-full justify-start">
                      <Phone className="h-4 w-4 mr-2" /> +91 98765 43210
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Mail className="h-4 w-4 mr-2" /> southdelhirealti@gmail.com
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
            
            {/* Similar Properties Section */}
            {/* This would be implemented with a query to fetch similar properties */}
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}

function Phone({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
  );
}

function Mail({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="20" height="16" x="2" y="4" rx="2"></rect>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
    </svg>
  );
}
