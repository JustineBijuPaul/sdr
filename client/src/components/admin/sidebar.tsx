import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Building, 
  MessageSquare, 
  LogOut,
  Menu,
  X,
  Home,
  Users,
  ChevronDown
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if user is a super admin
  const isSuperAdmin = user?.role === 'superadmin';

  // Define sidebar links with conditional staff management link
  const sidebarLinks = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Properties",
      href: "/admin/properties",
      icon: <Building className="h-5 w-5" />,
    },
    {
      title: "Inquiries",
      href: "/admin/inquiries",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    // Only show Staff Management for super admins
    ...(isSuperAdmin 
      ? [{
          title: "Staff Management",
          href: "/admin/staff",
          icon: <Users className="h-5 w-5" />,
        }] 
      : []),
  ];

  const isActive = (path: string) => {
    // For the admin home path
    if (path === '/admin' && location === '/admin') {
      return true;
    }
    // For sub paths
    return location.startsWith(path) && path !== '/admin';
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.username) return "U";
    return user.username.charAt(0).toUpperCase();
  };

  return (
    <>
      {/* Mobile Top Navigation */}
      <div className="lg:hidden border-b bg-white sticky top-0 z-50">
        {/* Top Bar with Logo and Toggle */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Link href="/admin">
              <h1 className="text-xl font-bold cursor-pointer hover:text-primary transition-colors">South Delhi Reality</h1>
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="outline" size="sm" className="mr-2">
                <Home className="h-4 w-4" />
              </Button>
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.username}</span>
                    <span className="text-xs text-muted-foreground">
                      {isSuperAdmin ? 'Super Admin' : 'Staff'}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <button 
                    className="w-full cursor-pointer text-red-500 focus:text-red-500"
                    onClick={() => logoutMutation.mutate()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {logoutMutation.isPending ? "Logging out..." : "Sign out"}
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation Links */}
        <div className={`${isMobileMenuOpen ? 'max-h-screen pb-4' : 'max-h-0'} overflow-hidden transition-all duration-300 ease-in-out`}>
          <nav className="px-4 flex flex-col space-y-1">
            {sidebarLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={isActive(link.href) ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.icon}
                  <span className="ml-3">{link.title}</span>
                </Button>
              </Link>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:block min-w-[100px] border-r h-screen bg-white fixed">
        <div className="h-full flex flex-col w-64">
          <div className="p-6 border-b">
            <Link href="/admin">
              <h2 className="text-xl font-bold text-primary cursor-pointer hover:opacity-80 transition-opacity">SD Reality Admin</h2>
            </Link>
            {user && (
              <p className="text-xs mt-1 text-muted-foreground">
                Logged in as: <span className="font-medium">{user.username}</span>
                {isSuperAdmin && <span className="ml-1 text-xs text-purple-600">(Super Admin)</span>}
              </p>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-4">
              {sidebarLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={isActive(link.href) ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    {link.icon}
                    <span className="ml-3">{link.title}</span>
                    {isActive(link.href) && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-primary" />
                    )}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-4">
              <Avatar>
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user?.username}</p>
                <p className="text-xs text-muted-foreground">
                  {isSuperAdmin ? 'Super Admin' : 'Staff'}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Link href="/">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Home className="mr-2 h-4 w-4" /> View Website
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {logoutMutation.isPending ? "Logging out..." : "Sign out"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
