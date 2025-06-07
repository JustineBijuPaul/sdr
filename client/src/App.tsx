import { WebSocketProvider } from "@/components/layout/websocket-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import DashboardPage from "@/pages/admin/dashboard-page";
import InquiriesPage from "@/pages/admin/inquiries-page";
import AdminPropertiesPage from "@/pages/admin/properties-page";
import PropertyEditPage from "@/pages/admin/property-edit-page";
import StaffManagementPage from "@/pages/admin/staff-management-page";
import AuthPage from "@/pages/auth-page";
import CookiesPage from "@/pages/cookies-page";
import HomePage from "@/pages/home-page";
import NotFound from "@/pages/not-found";
import PrivacyPage from "@/pages/privacy-page";
import PropertiesPage from "@/pages/properties-page";
import PropertyDetailPage from "@/pages/property-detail-page";
import TermsPage from "@/pages/terms-page";
import { QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={HomePage} />
      <Route path="/properties" component={PropertiesPage} />
      <Route path="/properties/:slug" component={PropertyDetailPage} />
      <Route path="/property/:slug">
        {(params: { slug: string }) => <Redirect to={`/properties/${params.slug}`} />}
      </Route>
      <Route path="/auth" component={AuthPage} />
      
      {/* Legal Pages */}
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/cookies" component={CookiesPage} />
      
      {/* Admin Routes */}
      <ProtectedRoute path="/admin" component={DashboardPage} />
      <ProtectedRoute path="/admin/properties" component={AdminPropertiesPage} />
      <ProtectedRoute path="/admin/properties/new" component={PropertyEditPage} />
      <ProtectedRoute path="/admin/properties/:id" component={PropertyEditPage} />
      <ProtectedRoute path="/admin/inquiries" component={InquiriesPage} />
      <ProtectedRoute path="/admin/staff" component={StaffManagementPage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WebSocketProvider>
          <Router />
          <Toaster />
        </WebSocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
