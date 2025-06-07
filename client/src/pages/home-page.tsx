import AboutSection from "@/components/home/about-section";
import ContactSection from "@/components/home/contact-section";
import FeaturedProperties from "@/components/home/featured-properties";
import HeroSection from "@/components/home/hero-section";
import PropertyCategories from "@/components/home/property-categories";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import PerformanceOptimizer from "@/components/seo/performance-optimizer";
import SEOHead, { generateOrganizationStructuredData } from "@/components/seo/seo-head";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Generate organization structured data for SEO
  const organizationStructuredData = generateOrganizationStructuredData();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/properties?limit=6');
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Premium Real Estate in South Delhi - Luxury Properties & Expert Services"
        description="Discover premium real estate in South Delhi. Browse luxury apartments, independent houses, villas & commercial properties in Greater Kailash, Defence Colony, Lajpat Nagar. Expert property consultants with 15+ years experience."
        keywords="south delhi real estate, premium properties south delhi, luxury apartments south delhi, independent houses south delhi, commercial property south delhi, greater kailash properties, defence colony real estate, lajpat nagar properties, property dealers south delhi, real estate agents south delhi"
        image="/sdrlogo.png"
        url="https://southdelhirealty.com/"
        type="website"
        structuredData={organizationStructuredData}
      />
      
      <PerformanceOptimizer />
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow">
          <HeroSection />
          <FeaturedProperties />
          <PropertyCategories />
          <AboutSection />
          <ContactSection />
        </main>
        
        <Footer />
      </div>
    </>
  );
}
