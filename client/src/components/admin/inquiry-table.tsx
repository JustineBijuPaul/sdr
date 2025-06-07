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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Inquiry } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Eye, Trash2 } from "lucide-react";
import { useState } from "react";

interface InquiryTableProps {
  inquiries: Inquiry[];
}

export default function InquiryTable({ inquiries }: InquiryTableProps) {
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/admin/inquiries/${id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
      toast({
        title: "Status updated",
        description: "The inquiry status has been updated successfully.",
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
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/inquiries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
      toast({
        title: "Inquiry deleted",
        description: "The inquiry has been deleted successfully.",
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
  
  // Handle status change
  const handleStatusChange = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };
  
  // Handle delete
  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };
  
  // View inquiry details
  const viewInquiry = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setViewDialogOpen(true);
  };
  
  // Get badge variant for status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "new":
        return "default";
      case "contacted":
        return "secondary";
      case "resolved":
        return "outline";
      default:
        return "default";
    }
  };
  
  // Format date
  const formatDate = (dateString: Date | null) => {
    if (!dateString) {
      return "No date available";
    }
    try {
      return format(dateString, "MMM d, yyyy 'at' h:mm a");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };
  
  if (!inquiries || inquiries.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <p className="text-gray-500">No inquiries found.</p>
      </div>
    );
  }
  
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inquiries.map((inquiry) => (
            <TableRow key={inquiry.id}>
              <TableCell className="font-medium">{inquiry.name}</TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>{inquiry.email}</div>
                  <div className="text-gray-500">{inquiry.phone}</div>
                </div>
              </TableCell>
              <TableCell>
                {inquiry.propertyId ? (
                  <span className="text-primary hover:underline cursor-pointer">
                    ID: {inquiry.propertyId}
                  </span>
                ) : (
                  <span className="text-gray-500">General Inquiry</span>
                )}
              </TableCell>
              <TableCell>{formatDate(inquiry.createdAt)}</TableCell>
              <TableCell>
                <Select
                  value={inquiry.status}
                  onValueChange={(value) => handleStatusChange(inquiry.id, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue>
                      <Badge variant={getStatusBadgeVariant(inquiry.status)}>
                        {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => viewInquiry(inquiry)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Inquiry</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this inquiry? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(inquiry.id)}
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
      
      {/* Inquiry details dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          {selectedInquiry && (
            <>
              <DialogHeader>
                <DialogTitle>Inquiry from {selectedInquiry.name}</DialogTitle>
                <DialogDescription>
                  Received on {formatDate(selectedInquiry.createdAt)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
                  <p className="mt-1"><strong>Email:</strong> {selectedInquiry.email}</p>
                  <p><strong>Phone:</strong> {selectedInquiry.phone}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Property ID</h4>
                  <p className="mt-1">{selectedInquiry.propertyId || "General Inquiry"}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Message</h4>
                  <p className="mt-1 whitespace-pre-wrap">{selectedInquiry.message}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <div className="mt-2">
                    <Select
                      value={selectedInquiry.status}
                      onValueChange={(value) => handleStatusChange(selectedInquiry.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue>
                          <Badge variant={getStatusBadgeVariant(selectedInquiry.status)}>
                            {selectedInquiry.status.charAt(0).toUpperCase() + selectedInquiry.status.slice(1)}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
