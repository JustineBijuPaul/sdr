import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [location] = useLocation();
  
  // Always check auth status for admin routes, regardless of current location
  // Skip user fetch only on public routes, but NEVER on admin routes
  const isPublicRoute = ['/', '/properties', '/properties/:slug', '/auth'].some(
    route => location.startsWith(route.replace(':slug', ''))
  );
  
  // Always enable the query for admin routes to ensure proper authentication
  const shouldCheckAuth = location.startsWith('/admin') || !isPublicRoute;
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/auth/status"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
    enabled: shouldCheckAuth, // Always check for admin routes
  });

  // Generate a token when user is logged in
  useEffect(() => {
    if (user) {
      // Generate a random token for WebSocket authentication
      // In a real app, this should come from your backend
      const newToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
      setToken(newToken);
    } else {
      setToken(null);
    }
  }, [user]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      console.log("Login successful, user object:", user);
      console.log("Username:", user.username);
      console.log("User type:", typeof user);
      console.log("User keys:", Object.keys(user || {}));
      
      // Set the user data in the cache first
      queryClient.setQueryData(["/api/auth/status"], user);
      
      // Wait a bit for the session cookie to be properly set, then invalidate
      setTimeout(() => {
        queryClient.invalidateQueries();
      }, 100);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${user?.username || user?.email || 'User'}!`,
      });
    },
    onError: (error: Error) => {
      console.log("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/auth/status"], user);
      toast({
        title: "Registration successful",
        description: `Welcome, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/status"], null);
      setToken(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        token,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
