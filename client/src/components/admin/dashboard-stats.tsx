import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { HomeIcon, Building2, DollarSign, Users } from "lucide-react";

type DashboardStats = {
  totalProperties: number;
  propertiesForSale: number;
  propertiesForRent: number;
  newInquiries: number;
};

export default function DashboardStats() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/admin/dashboard'],
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="bg-gray-200 h-6 w-28 rounded"></CardTitle>
              <div className="h-10 w-10 rounded-full bg-gray-200"></div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-200 h-8 w-16 rounded mb-1"></div>
              <div className="bg-gray-200 h-4 w-24 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Properties",
      value: stats?.totalProperties || 0,
      icon: <HomeIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />,
      description: "Listed on the platform",
    },
    {
      title: "For Sale",
      value: stats?.propertiesForSale || 0,
      icon: <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />,
      description: "Properties for sale",
    },
    {
      title: "For Rent",
      value: stats?.propertiesForRent || 0,
      icon: <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />,
      description: "Properties for rent",
    },
    {
      title: "New Inquiries",
      value: stats?.newInquiries || 0,
      icon: <Users className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />,
      description: "Pending responses",
    },
  ];

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
      {statCards.map((card, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              {card.title}
            </CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pt-2 pb-3">
            <div className="text-xl sm:text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
