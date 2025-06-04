import Sidebar from "@/components/admin/sidebar";
import DashboardStats from "@/components/admin/dashboard-stats";
import { useQuery } from "@tanstack/react-query";
import { Property, Inquiry } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, ArrowUpRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  // Fetch properties
  const { data: properties } = useQuery<Property[]>({
    queryKey: ['/api/admin/properties'],
  });
  
  // Fetch inquiries
  const { data: inquiries } = useQuery<Inquiry[]>({
    queryKey: ['/api/admin/inquiries?status=new'],
  });

  // Get recent properties
  const recentProperties = properties?.slice(0, 5);
  
  // Get recent inquiries
  const recentInquiries = inquiries?.slice(0, 5);

  // Format date
  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "";
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Sidebar />
      
      <div className="flex-1 lg:pl-[250px] overflow-y-auto pt-0 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
            <Link href="/admin/properties/new">
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" /> Add Property
              </Button>
            </Link>
          </div>
          
          {/* Stats */}
          <DashboardStats />
          
          <div className="grid grid-cols-1 gap-6 mt-6 lg:mt-8">
            {/* Recent Properties */}
            <Card className="col-span-1">
              <CardHeader className="flex flex-col xs:flex-row items-start xs:items-center justify-between space-y-2 xs:space-y-0 pb-4">
                <div>
                  <CardTitle>Recent Properties</CardTitle>
                  <CardDescription>Recently added properties</CardDescription>
                </div>
                <Link href="/admin/properties">
                  <Button variant="ghost" size="sm" className="gap-1 mt-2 xs:mt-0">
                    View All <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {recentProperties && recentProperties.length > 0 ? (
                  <div className="space-y-4">
                    {recentProperties.map((property) => (
                      <div key={property.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-lg hover:bg-slate-50">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="font-semibold text-primary">#{property.id}</span>
                          </div>
                          <div className="min-w-0">
                            <Link href={`/admin/properties/${property.id}`}>
                              <p className="font-medium hover:text-primary truncate">{property.title}</p>
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(property.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="ml-13 sm:ml-0">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            property.status === 'sale' 
                              ? 'bg-primary/10 text-primary' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {property.status === 'sale' ? 'For Sale' : 'For Rent'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No properties found
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Recent Inquiries */}
            <Card className="col-span-1">
              <CardHeader className="flex flex-col xs:flex-row items-start xs:items-center justify-between space-y-2 xs:space-y-0 pb-4">
                <div>
                  <CardTitle>Recent Inquiries</CardTitle>
                  <CardDescription>Latest inquiries from customers</CardDescription>
                </div>
                <Link href="/admin/inquiries">
                  <Button variant="ghost" size="sm" className="gap-1 mt-2 xs:mt-0">
                    View All <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {recentInquiries && recentInquiries.length > 0 ? (
                  <div className="space-y-4">
                    {recentInquiries.map((inquiry) => (
                      <div key={inquiry.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-lg hover:bg-slate-50">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="font-semibold text-blue-700">{inquiry.name.charAt(0)}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{inquiry.name}</p>
                            <p className="text-sm text-muted-foreground truncate">{inquiry.email}</p>
                          </div>
                        </div>
                        <div className="ml-13 sm:ml-0 text-right sm:text-left">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(inquiry.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No inquiries found
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6 lg:mt-8 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common management tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Link href="/admin/properties/new" className="w-full">
                    <Button variant="outline" className="w-full justify-start h-auto py-4">
                      <div className="flex flex-col items-start text-left">
                        <span className="font-medium">Add New Property</span>
                        <span className="text-xs text-muted-foreground">Create a new property listing</span>
                      </div>
                    </Button>
                  </Link>
                  <Link href="/admin/inquiries" className="w-full">
                    <Button variant="outline" className="w-full justify-start h-auto py-4">
                      <div className="flex flex-col items-start text-left">
                        <span className="font-medium">View Inquiries</span>
                        <span className="text-xs text-muted-foreground">Manage customer requests</span>
                      </div>
                    </Button>
                  </Link>
                  <Link href="/admin/properties" className="w-full">
                    <Button variant="outline" className="w-full justify-start h-auto py-4">
                      <div className="flex flex-col items-start text-left">
                        <span className="font-medium">Manage Properties</span>
                        <span className="text-xs text-muted-foreground">View and edit all listings</span>
                      </div>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
