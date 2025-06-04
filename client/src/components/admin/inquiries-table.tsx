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
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
    Inquiry, Property
} from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
    CheckCircle,
    Eye,
    Mail,
    MessageCircle,
    MoreVertical,
    Trash2
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

// Define a type for inquiries with property info
type InquiryWithProperty = Inquiry & {
  property?: Property | null;
}

export default function InquiriesTable() {
  const { toast } = useToast();
  const [inquiryToDelete, setInquiryToDelete] = useState<number | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryWithProperty | null>(null);
  
  // Fetch inquiries
  const { data: inquiriesData, isLoading, error } = useQuery({
    queryKey: ["inquiries"],
    queryFn: async () => {
      const response = await fetch("/api/admin/inquiries");
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Not authenticated. Please log in to access inquiries.");
        }
        throw new Error(`Failed to fetch inquiries: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Ensure we always return an array
      if (!Array.isArray(data)) {
        console.error("Received non-array data from inquiries API:", data);
        throw new Error("Invalid data format received from server");
      }
      
      return data;
    },
  });

  // Ensure inquiries is always an array
  const inquiries = Array.isArray(inquiriesData) ? inquiriesData : [];

  // Log error if authentication failed
  useEffect(() => {
    if (error) {
      console.error("Error fetching inquiries:", error);
      if (error.message.includes("Not authenticated")) {
        toast({
          title: "Authentication required",
          description: "Please log in to access inquiries.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch inquiries",
          variant: "destructive",
        });
      }
    }
  }, [error, toast]);

  // Log inquiries data for debugging
  useEffect(() => {
    console.log("Inquiries data received:", inquiriesData);
    console.log("Processed inquiries array:", inquiries);
    
    if (inquiries && Array.isArray(inquiries)) {
      const inquiriesWithPropertyData = inquiries.filter(inquiry => inquiry.property);
      console.log(`${inquiriesWithPropertyData.length} inquiries have property data`);
      
      const inquiriesWithoutPropertyData = inquiries.filter(inquiry => !inquiry.property);
      if (inquiriesWithoutPropertyData.length > 0) {
        console.log(`${inquiriesWithoutPropertyData.length} inquiries missing property data:`, 
          inquiriesWithoutPropertyData.map(i => `ID: ${i.id}, PropertyID: ${i.propertyId}`));
      }
    }
  }, [inquiries, inquiriesData]);

  // Delete inquiry mutation
  const deleteInquiryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/inquiries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/inquiries'] });
      toast({
        title: "Inquiry deleted",
        description: "Inquiry has been deleted successfully",
      });
      setInquiryToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update inquiry status mutation
  const updateInquiryStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      await apiRequest("PUT", `/api/admin/inquiries/${id}`, {
        status
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/inquiries'] });
      toast({
        title: "Status updated",
        description: "Inquiry status has been updated successfully",
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

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'new':
        return <Badge variant="default">New</Badge>;
      case 'contacted':
        return <Badge variant="secondary">Contacted</Badge>;
      case 'resolved':
        return <Badge variant="outline">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format phone number for WhatsApp
  const formatPhoneForWhatsApp = (phone: string) => {
    // Remove any non-numeric characters
    const numericPhone = phone.replace(/\D/g, '');
    
    // If the phone number doesn't start with a +, assume it's a local number
    // and add the India country code (+91) if not already present
    if (!numericPhone.startsWith('91') && numericPhone.length === 10) {
      return `91${numericPhone}`;
    }
    
    // Otherwise just return the cleaned numeric version
    return numericPhone;
  };

  return (
    <div>
      {/* Add debug button temporarily */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          console.log("=== INQUIRIES DEBUG ===");
          console.log("Raw inquiries data:", inquiriesData);
          console.log("Processed inquiries:", inquiries);
          console.log("Is inquiries an array?", Array.isArray(inquiries));
          console.log("Inquiries length:", Array.isArray(inquiries) ? inquiries.length : "N/A");
          
          if (Array.isArray(inquiries)) {
            const inquiriesWithPropertyData = inquiries.filter(inquiry => inquiry.property);
            console.log(`${inquiriesWithPropertyData.length} inquiries have property data`);
            
            const inquiriesWithoutPropertyData = inquiries.filter(inquiry => !inquiry.property);
            if (inquiriesWithoutPropertyData.length > 0) {
              console.log(`Missing property data for inquiries:`, 
                inquiriesWithoutPropertyData.map(i => `ID: ${i.id}, PropertyID: ${i.propertyId}`));
            }
          } else {
            console.error("❌ Inquiries is not an array!");
          }
          
          console.log("Query loading state:", isLoading);
          console.log("Query error:", error);
          console.log("===================");
        }}
      >
        Debug
      </Button>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email/Phone</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>Loading inquiries...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="text-red-500">
                    <p className="font-medium">Failed to load inquiries</p>
                    <p className="text-sm text-muted-foreground">
                      {error.message.includes("Not authenticated") 
                        ? "Please log in to access this page" 
                        : error.message || "An error occurred"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : inquiries && Array.isArray(inquiries) && inquiries.length > 0 ? (
              inquiries.map((inquiry: InquiryWithProperty) => (
                <TableRow key={inquiry.id}>
                  <TableCell className="font-medium">{inquiry.name}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{inquiry.email}</div>
                      <div>{inquiry.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {inquiry.propertyId ? (
                      <>
                        {inquiry.property ? (
                          <Link 
                            href={`/properties/${inquiry.property.slug}`} 
                            className="text-primary underline cursor-pointer hover:text-primary/80"
                          >
                            {inquiry.property.title}
                          </Link>
                        ) : (
                          <div>
                            <Link 
                              href={`/admin/properties/edit/${inquiry.propertyId}`}
                              className="text-orange-500 font-medium hover:underline"
                            >
                              Property #{inquiry.propertyId}
                            </Link>
                            <div className="text-xs text-red-500 mt-1">
                              (Property data missing)
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-muted-foreground text-sm">General Inquiry</span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(inquiry.createdAt)}</TableCell>
                  <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <Dialog>
                          <DialogTrigger asChild>
                            <DropdownMenuItem 
                              onSelect={(e) => {
                                e.preventDefault();
                                setSelectedInquiry(inquiry);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" /> View Details
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            {selectedInquiry && (
                              <>
                                <DialogHeader>
                                  <DialogTitle>Inquiry Details</DialogTitle>
                                  <DialogDescription>
                                    Received {formatDate(selectedInquiry.createdAt)}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="py-4 space-y-4">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <h4 className="text-sm font-medium">Name</h4>
                                      <p>{selectedInquiry.name}</p>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium">Status</h4>
                                      <div>{getStatusBadge(selectedInquiry.status)}</div>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium">Email</h4>
                                      <p>{selectedInquiry.email}</p>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium">Phone</h4>
                                      <p>{selectedInquiry.phone}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <h4 className="text-sm font-medium">Property</h4>
                                      {selectedInquiry.propertyId ? (
                                        selectedInquiry.property ? (
                                          <Link 
                                            href={`/properties/${selectedInquiry.property.slug}`}
                                            className="text-primary hover:underline"
                                          >
                                            {selectedInquiry.property.title}
                                          </Link>
                                        ) : (
                                          <div>
                                            <Link 
                                              href={`/admin/properties/edit/${selectedInquiry.propertyId}`}
                                              className="text-orange-500 font-medium hover:underline"
                                            >
                                              Property #{selectedInquiry.propertyId}
                                            </Link>
                                          </div>
                                        )
                                      ) : (
                                        <p className="text-muted-foreground">General Inquiry</p>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium">Message</h4>
                                    <p className="mt-1 text-sm whitespace-pre-line border p-3 rounded-md bg-muted">
                                      {selectedInquiry.message}
                                    </p>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <div className="flex justify-between w-full flex-wrap gap-2">
                                    <div className="flex gap-2">
                                      <Button 
                                        variant="outline"
                                        size="sm"
                                        onClick={() => updateInquiryStatusMutation.mutate({
                                          id: selectedInquiry.id,
                                          status: selectedInquiry.status === 'resolved' ? 'new' : 'resolved'
                                        })}
                                      >
                                        {selectedInquiry.status === 'resolved' ? 'Mark as New' : 'Mark as Resolved'}
                                      </Button>

                                      <Button 
                                        variant="outline"
                                        size="sm"
                                        className="gap-1 text-green-600 border-green-600"
                                        onClick={() => {
                                          const phone = formatPhoneForWhatsApp(selectedInquiry.phone);
                                          // Default message mentioning the property if available
                                          let message = `Hello ${selectedInquiry.name}, this is regarding your inquiry`;
                                          if (selectedInquiry.property) {
                                            message += ` about "${selectedInquiry.property.title}"`;
                                          }
                                          message += " on South Delhi Real Estate.";
                                          
                                          // Encode the message for the URL
                                          const encodedMessage = encodeURIComponent(message);
                                          
                                          // Open WhatsApp in a new tab
                                          window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
                                          
                                          // Update status to contacted if it's new
                                          if (selectedInquiry.status === 'new') {
                                            updateInquiryStatusMutation.mutate({
                                              id: selectedInquiry.id,
                                              status: 'contacted'
                                            });
                                          }
                                        }}
                                      >
                                        <MessageCircle className="h-4 w-4" /> 
                                        WhatsApp
                                      </Button>
                                    </div>
                                    <div>
                                      <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => {
                                          window.location.href = `mailto:${selectedInquiry.email}?subject=Re: Your Inquiry at South Delhi Reality`;
                                        }}
                                      >
                                        <Mail className="h-4 w-4 mr-2" /> Reply via Email
                                      </Button>
                                    </div>
                                  </div>
                                </DialogFooter>
                              </>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <DropdownMenuItem 
                          onClick={() => {
                            const phone = formatPhoneForWhatsApp(inquiry.phone);
                            // Default message mentioning the property if available
                            let message = `Hello ${inquiry.name}, this is regarding your inquiry`;
                            if (inquiry.property) {
                              message += ` about "${inquiry.property.title}"`;
                            }
                            message += " on South Delhi Real Estate.";
                            
                            // Encode the message for the URL
                            const encodedMessage = encodeURIComponent(message);
                            
                            // Open WhatsApp in a new tab
                            window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
                            
                            // Update status to contacted if it's new
                            if (inquiry.status === 'new') {
                              updateInquiryStatusMutation.mutate({
                                id: inquiry.id,
                                status: 'contacted'
                              });
                            }
                          }}
                        >
                          <MessageCircle className="h-4 w-4 mr-2 text-green-600" /> 
                          Chat on WhatsApp
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          onClick={() => updateInquiryStatusMutation.mutate({
                            id: inquiry.id,
                            status: inquiry.status === 'contacted' ? 'new' : 'contacted'
                          })}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" /> 
                          {inquiry.status === 'contacted' ? 'Mark as New' : 'Mark as Contacted'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => updateInquiryStatusMutation.mutate({
                            id: inquiry.id,
                            status: inquiry.status === 'resolved' ? 'new' : 'resolved'
                          })}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" /> 
                          {inquiry.status === 'resolved' ? 'Mark as New' : 'Mark as Resolved'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog open={inquiryToDelete === inquiry.id} onOpenChange={(open) => {
                          if (!open) setInquiryToDelete(null);
                        }}>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              onSelect={(e) => {
                                e.preventDefault();
                                setInquiryToDelete(inquiry.id);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the inquiry.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-red-600"
                                onClick={() => {
                                  if (inquiryToDelete) {
                                    deleteInquiryMutation.mutate(inquiryToDelete);
                                  }
                                }}
                              >
                                {deleteInquiryMutation.isPending ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No inquiries found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
