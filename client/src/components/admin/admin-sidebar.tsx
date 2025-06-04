import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Building, 
  MessageSquare, 
  LogOut, 
  ChevronRight,
  Menu,
  X,
  Users
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function AdminSidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Check if the current location matches a path
  const isActive = (path: string) => {
    return location.startsWith(path);
  };
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.username) return "U";
    return user.username.charAt(0).toUpperCase();
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Check if user is a super admin
  const isSuperAdmin = user?.role === 'superadmin';
  
  const menuItems = [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/properties", label: "Properties", icon: Building },
    { path: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
    // Only show the Staff menu item to super admins
    ...(isSuperAdmin ? [{ path: "/admin/staff", label: "Staff Management", icon: Users }] : []),
  ];
  
  const SidebarContent = () => (
    <div className="h-full flex flex-col py-6">
      <div className="px-6 mb-6">
        <h2 className="text-xl font-bold text-primary">SD Reality Admin</h2>
      </div>
      
      <Separator className="mb-6" />
      
      <div className="flex-1 px-4">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <Button
                variant={isActive(item.path) ? "default" : "ghost"}
                className={`w-full justify-start ${isActive(item.path) ? "" : "text-muted-foreground"}`}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.label}
                {isActive(item.path) && (
                  <ChevronRight className="ml-auto h-5 w-5" />
                )}
              </Button>
            </Link>
          ))}
        </div>
      </div>
      
      <Separator className="mt-6 mb-6" />
      
      <div className="px-6">
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
        
        <Button 
          variant="outline" 
          className="w-full justify-start" 
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );
  
  // Mobile sidebar
  const MobileSidebar = () => (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="lg:hidden mr-2"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72">
        <SidebarContent />
      </SheetContent>
    </Sheet>
  );
  
  return (
    <>
      {/* Mobile sidebar */}
      <MobileSidebar />
      
      {/* Desktop sidebar */}
      <div className="hidden lg:block min-w-[250px] border-r h-screen">
        <SidebarContent />
      </div>
    </>
  );
}
