import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Property } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Eye } from "lucide-react";

interface PropertyTableProps {
  properties: Property[];
}

export default function PropertyTable({ properties }: PropertyTableProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Update property status mutation
  const updatePropertyMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest("PUT", `/api/admin/properties/${id}`, { isActive });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/properties"] });
      toast({
        title: "Status updated",
        description: "The property status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete property mutation
  const deletePropertyMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/properties/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/properties"] });
      toast({
        title: "Property deleted",
        description: "The property has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle property status toggle
  const togglePropertyStatus = (id: number, currentStatus: boolean) => {
    updatePropertyMutation.mutate({ id, isActive: !currentStatus });
  };
  
  // Handle property delete
  const deleteProperty = (id: number) => {
    deletePropertyMutation.mutate(id);
  };
  
  // Format price for display
  const formatPrice = (price: number, status: string) => {
    if (status === "sale") {
      if (price >= 10000000) {
        return `₹${(price / 10000000).toFixed(2)} Cr`;
      } else if (price >= 100000) {
        return `₹${(price / 100000).toFixed(2)} L`;
      }
    } else {
      if (price >= 100000) {
        return `₹${(price / 100000).toFixed(2)} L/mo`;
      }
    }
    return `₹${price.toLocaleString()}`;
  };
  
  // Format date
  const formatDate = (dateString: Date | null) => {
    if (!dateString) {
      return "No date available";
    }
    try {
      return format(dateString, "MMM d, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };
  
  if (!properties || properties.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <p className="text-gray-500">No properties found.</p>
        <Button className="mt-4" onClick={() => navigate("/admin/properties/new")}>
          Add New Property
        </Button>
      </div>
    );
  }
  
  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">ID</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Active</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.map((property) => (
            <TableRow key={property.id}>
              <TableCell>{property.id}</TableCell>
              <TableCell className="font-medium">{property.title}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{property.propertyType}</span>
                  <span className="text-xs text-gray-500">{property.subType}</span>
                </div>
              </TableCell>
              <TableCell>
                {formatPrice(property.price, property.status)}
                {property.priceNegotiable && (
                  <span className="text-xs text-gray-500 block">Negotiable</span>
                )}
              </TableCell>
              <TableCell>{property.contactDetails?.split(',')[0] || 'No location'}</TableCell>
              <TableCell>{formatDate(property.createdAt)}</TableCell>
              <TableCell>
                <Badge variant={property.status === "sale" ? "sale" : "rent"}>
                  For {property.status === "sale" ? "Sale" : "Rent"}
                </Badge>
              </TableCell>
              <TableCell>
                <Switch
                  checked={property.isActive}
                  onCheckedChange={() => togglePropertyStatus(property.id, property.isActive)}
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Link href={`/properties/${property.slug}`}>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  
                  <Link href={`/admin/properties/edit/${property.id}`}>
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Property</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{property.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteProperty(property.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
