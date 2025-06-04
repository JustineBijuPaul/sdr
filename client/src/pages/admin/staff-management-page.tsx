import Sidebar from "@/components/admin/sidebar";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Edit, PlusCircle, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { z } from "zod";

// Extend user schema to allow selecting role
const createUserSchema = insertUserSchema.extend({
  role: z.enum(["admin", "staff", "superadmin"], {
    required_error: "Please select a role",
  }),
});

// Schema for editing user (without password requirement)
const editUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email format"),
  role: z.enum(["admin", "staff", "superadmin"], {
    required_error: "Please select a role",
  }),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;
type EditUserFormValues = z.infer<typeof editUserSchema>;

// Define a type for staff users
interface StaffUser {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function StaffManagementPage() {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<StaffUser | null>(null);

  // Check if user is super admin
  const isSuperAdmin = user?.role === "superadmin";
  
  // Redirect if not super admin - move to useEffect to avoid rendering issues
  useEffect(() => {
    if (user && !isSuperAdmin) {
      navigate("/admin");
      toast({
        title: "Access Denied",
        description: "Only super admins can access the staff management page.",
        variant: "destructive",
      });
    }
  }, [user, isSuperAdmin, navigate, toast]);

  // Fetch staff users - proper typing for staffUsers
  const {
    data: staffUsers = [] as StaffUser[],
    isLoading,
    error,
  } = useQuery<StaffUser[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!isSuperAdmin, // Only fetch if user is a super admin
  });

  // Setup user creation form
  const createForm = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "staff",
    },
  });

  // Setup user edit form
  const editForm = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      username: "",
      email: "",
      role: "staff",
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (values: CreateUserFormValues) => {
      const res = await apiRequest("POST", "/api/admin/users", values);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User created",
        description: "The staff member has been created successfully.",
      });
      createForm.reset();
      setIsCreateDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "User creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (values: EditUserFormValues & { id: number }) => {
      const { id, ...updateData } = values;
      const res = await apiRequest("PUT", `/api/admin/users/${id}`, updateData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User updated",
        description: "The staff member has been updated successfully.",
      });
      editForm.reset();
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: "User update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${userId}`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User deleted",
        description: "The staff member has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: "User deletion failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submissions
  function onCreateSubmit(values: CreateUserFormValues) {
    createUserMutation.mutate(values);
  }

  function onEditSubmit(values: EditUserFormValues) {
    if (selectedUser) {
      updateUserMutation.mutate({ ...values, id: selectedUser.id });
    }
  }

  // Handle edit button click
  function handleEditClick(staffUser: StaffUser) {
    setSelectedUser(staffUser);
    editForm.reset({
      username: staffUser.username,
      email: staffUser.email,
      role: staffUser.role as "admin" | "staff" | "superadmin",
    });
    setIsEditDialogOpen(true);
  }

  // Handle delete button click
  function handleDeleteClick(staffUser: StaffUser) {
    setSelectedUser(staffUser);
    setIsDeleteDialogOpen(true);
  }

  // Handle delete confirmation
  function handleDeleteConfirm() {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) {
      return "N/A";
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    
    return format(date, "MMM d, yyyy");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Sidebar />
      
      <div className="flex-1 p-4 sm:p-6 lg:p-8 lg:pl-[250px]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Staff Management</h1>
              <p className="text-muted-foreground">
                Create and manage staff members
              </p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" /> Add Staff Member
            </Button>
          </div>

          {!isSuperAdmin ? (
            <div className="rounded-lg border p-8 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Access Restricted</h2>
              <p className="text-muted-foreground mb-6">
                Only super administrators can access the staff management page.
              </p>
            </div>
          ) : (
            // Only render the actual content if the user is a super admin
            <>
              {isLoading ? (
                <div className="rounded-lg border p-8 text-center">
                  <p>Loading staff members...</p>
                </div>
              ) : error ? (
                <div className="rounded-lg border p-8 text-center">
                  <p className="text-destructive">
                    Error loading staff members: {(error as Error).message}
                  </p>
                </div>
              ) : staffUsers.length === 0 ? (
                <div className="rounded-lg border p-8 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">No Staff Members</h2>
                  <p className="text-muted-foreground mb-6">
                    You haven't added any staff members yet.
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    Add Staff Member
                  </Button>
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staffUsers.map((staffUser: StaffUser) => (
                        <TableRow key={staffUser.id}>
                          <TableCell className="font-medium">
                            {staffUser.username}
                          </TableCell>
                          <TableCell>{staffUser.email}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                staffUser.role === "superadmin"
                                  ? "bg-purple-100 text-purple-800"
                                  : staffUser.role === "admin"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {staffUser.role}
                            </span>
                          </TableCell>
                          <TableCell>
                            {formatDate(staffUser.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditClick(staffUser)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(staffUser)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Create User Dialog - Only available to super admins */}
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create Staff User</DialogTitle>
                    <DialogDescription>
                      Add a new staff member to the admin panel.
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...createForm}>
                    <form
                      onSubmit={createForm.handleSubmit(onCreateSubmit)}
                      className="space-y-4 py-4"
                    >
                      <FormField
                        control={createForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="staff">Staff</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="superadmin">Super Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createUserMutation.isPending}
                        >
                          {createUserMutation.isPending
                            ? "Creating..."
                            : "Create User"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

              {/* Edit User Dialog - Only available to super admins */}
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Staff User</DialogTitle>
                    <DialogDescription>
                      Edit the details of the staff member.
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...editForm}>
                    <form
                      onSubmit={editForm.handleSubmit(onEditSubmit)}
                      className="space-y-4 py-4"
                    >
                      <FormField
                        control={editForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={editForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={editForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="staff">Staff</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="superadmin">Super Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={updateUserMutation.isPending}
                        >
                          {updateUserMutation.isPending
                            ? "Updating..."
                            : "Update User"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

              {/* Delete User Dialog - Only available to super admins */}
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the staff member.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteConfirm}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>
    </div>
  );
}