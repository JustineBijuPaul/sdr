import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-primary font-bold text-2xl">South Delhi Reality</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className={`font-medium ${isActive('/') ? 'text-primary' : 'hover:text-primary'}`}>
              Home
            </Link>
            <Link href="/properties?status=sale" className={`font-medium ${location.startsWith('/properties') && location.includes('status=sale') ? 'text-primary' : 'hover:text-primary'}`}>
              Buy
            </Link>
            <Link href="/properties?status=rent" className={`font-medium ${location.startsWith('/properties') && location.includes('status=rent') ? 'text-primary' : 'hover:text-primary'}`}>
              Rent
            </Link>
            <Link href="/properties?category=commercial" className={`font-medium ${location.startsWith('/properties') && location.includes('category=commercial') ? 'text-primary' : 'hover:text-primary'}`}>
              Commercial
            </Link>
            <a href="#about" className="font-medium hover:text-primary">About Us</a>
            <a href="#contact" className="font-medium hover:text-primary">Contact</a>
          </nav>
          
          {/* Mobile Navigation Toggle */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
          {/* 
          <div className="hidden md:block">
            {user ? (
              <Link href="/admin">
                <Button>Admin Dashboard</Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button>Admin Login</Button>
              </Link>
            )}
          </div> */}
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4">
            <Link href="/" className="block py-2 hover:text-primary">Home</Link>
            <Link href="/properties?status=sale" className="block py-2 hover:text-primary">Buy</Link>
            <Link href="/properties?status=rent" className="block py-2 hover:text-primary">Rent</Link>
            <Link href="/properties?category=commercial" className="block py-2 hover:text-primary">Commercial</Link>
            <a href="#about" className="block py-2 hover:text-primary">About Us</a>
            <a href="#contact" className="block py-2 hover:text-primary">Contact</a>
            {/* {user ? (
              <Link href="/admin" className="block py-2 mt-2 bg-primary text-white px-4 rounded-md text-center">
                Admin Dashboard
              </Link>
            ) : (
              <Link href="/auth" className="block py-2 mt-2 bg-primary text-white px-4 rounded-md text-center">
                Admin Login
              </Link>
            )} */}
          </div>
        )}
      </div>
    </header>
  );
}
