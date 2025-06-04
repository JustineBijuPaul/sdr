import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

export default function HeroSection() {
  const [, navigate] = useLocation();
  const [propertyType, setPropertyType] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [transactionType, setTransactionType] = useState("sale");

  const handleSearch = () => {
    let url = `/properties?status=${transactionType}`;
    
    if (propertyType) {
      url += `&propertyType=${propertyType}`;
    }
    
    if (location) {
      url += `&location=${location}`;
    }
    
    if (budget) {
      url += `&budget=${budget}`;
    }
    
    navigate(url);
  };

  return (
    <section className="relative h-[600px] md:h-[600px] bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80')` }}>
      <div className="absolute inset-0 bg-dark/50"></div>
      <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center relative z-10">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center mb-6">
          Find Your Dream Property in South Delhi
        </h1>
        <p className="text-xl text-white text-center mb-10 max-w-2xl">
          Discover luxury apartments, independent houses, and commercial spaces in prime South Delhi locations.
        </p>
        
        {/* Search Form */}
        <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label className="block text-sm font-medium mb-1">Property Type</Label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Property Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Property Types</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="independent_house">Independent House</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="farm_house">Farm House</SelectItem>
                  <SelectItem value="shop">Shop</SelectItem>
                  <SelectItem value="basement">Basement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-sm font-medium mb-1">Location</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="greater_kailash">Greater Kailash</SelectItem>
                  <SelectItem value="defence_colony">Defence Colony</SelectItem>
                  <SelectItem value="hauz_khas">Hauz Khas</SelectItem>
                  <SelectItem value="saket">Saket</SelectItem>
                  <SelectItem value="vasant_kunj">Vasant Kunj</SelectItem>
                  <SelectItem value="malviya_nagar">Malviya Nagar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-sm font-medium mb-1">Budget</Label>
              <Select value={budget} onValueChange={setBudget}>
                <SelectTrigger>
                  <SelectValue placeholder="No Budget Limit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_limit">No Budget Limit</SelectItem>
                  <SelectItem value="under_50L">Under ₹50 Lakhs</SelectItem>
                  <SelectItem value="50L_1Cr">₹50 Lakhs - 1 Crore</SelectItem>
                  <SelectItem value="1Cr_2Cr">₹1 Crore - 2 Crore</SelectItem>
                  <SelectItem value="2Cr_5Cr">₹2 Crore - 5 Crore</SelectItem>
                  <SelectItem value="above_5Cr">Above ₹5 Crore</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex space-x-4">
              <RadioGroup defaultValue="sale" value={transactionType} onValueChange={setTransactionType} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sale" id="buy" />
                  <Label htmlFor="buy">Buy</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rent" id="rent" />
                  <Label htmlFor="rent">Rent</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="text-right">
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" /> Search
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
