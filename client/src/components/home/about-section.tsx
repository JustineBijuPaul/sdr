import {
    Clock,
    Handshake,
    Home,
    MapPin,
    TrendingUp
} from "lucide-react";

export default function AboutSection() {
  return (
    <section id="about" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">About South Delhi Realty</h2>
            <p className="text-gray-600 mb-4">
              South Delhi Realty is the premier real estate agency specializing in the most prestigious neighborhoods of South Delhi. With over 15 years of experience, we have established ourselves as the trusted partner for buyers, sellers, and renters looking for exceptional properties in this coveted area.
            </p>
            <p className="text-gray-600 mb-6">
              Our team of expert real estate professionals has deep knowledge of the South Delhi market and is committed to providing personalized service to meet your property needs.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-start">
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <Home className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Premium Properties</h3>
                  <p className="text-sm text-gray-600">Exclusive access to the finest properties</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Local Expertise</h3>
                  <p className="text-sm text-gray-600">Deep knowledge of South Delhi areas</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Expertise</h3>
                  <p className="text-sm text-gray-600">20+ years of experience in the real estate market</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <Handshake className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Trusted Advisors</h3>
                  <p className="text-sm text-gray-600">Transparent and ethical service</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">24/7 Support</h3>
                  <p className="text-sm text-gray-600">Always available for our clients</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:block">
            <img 
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" 
              alt="South Delhi Realty Team" 
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
