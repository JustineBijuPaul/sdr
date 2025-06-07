import { Facebook, Instagram, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-12 justify-center text-center">
          <div>
            <h3 className="text-xl font-bold mb-6">South Delhi Realty</h3>
            <p className="text-gray-300 mb-6">
              Your trusted partner for premium real estate in South Delhi. We help you find your dream property with personalized service and local expertise.
            </p>
            <div className="flex space-x-4 justify-center">
              <a href="https://www.facebook.com/profile.php?id=100091444635702&mibextid=rS40aB7S9Ucbxw6v" target="_blank" className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition">
                <Facebook size={18} />
              </a>
              <a href="https://www.instagram.com/southdelhirealty" target="_blank" className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition">
                <Instagram size={18} />
              </a>
              <a href="https://wa.me/919911248822?text=message_text" target="_blank" className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition">
                <MessageCircle size={18} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} South Delhi Realty. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="/terms" className="text-gray-400 hover:text-white transition">Terms</a>
              <a href="/privacy" className="text-gray-400 hover:text-white transition">Privacy</a>
              <a href="/cookies" className="text-gray-400 hover:text-white transition">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
