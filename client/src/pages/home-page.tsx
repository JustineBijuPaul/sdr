import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import HeroSection from "@/components/home/hero-section";
import FeaturedProperties from "@/components/home/featured-properties";
import PropertyCategories from "@/components/home/property-categories";
import AboutSection from "@/components/home/about-section";
import ContactSection from "@/components/home/contact-section";

export default function HomePage() {
  return (
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
  );
}
