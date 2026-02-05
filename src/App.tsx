import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import AirlineDashboard from "./pages/AirlineDashboard";
import MyRFPsPage from "./pages/airline/MyRFPsPage";
import RFPDetailPage from "./pages/airline/RFPDetailPage";
import VendorMatchesPage from "./pages/airline/VendorMatchesPage";
import AdoptionTrackerPage from "./pages/airline/AdoptionTrackerPage";
import SettingsPage from "./pages/airline/SettingsPage";
import VendorDashboard from "./pages/VendorDashboard";
import VendorProposalsPage from "./pages/vendor/VendorProposalsPage";
import VendorAnalyticsPage from "./pages/vendor/VendorAnalyticsPage";
import VendorRespond from "./pages/VendorRespond";
import ConsultantDashboard from "./pages/ConsultantDashboard";
import AuditDetailPage from "./pages/consultant/AuditDetailPage";
import ClientsPage from "./pages/consultant/ClientsPage";
import ConsultantAnalyticsPage from "./pages/consultant/AnalyticsPage";
import ConsultantSettingsPage from "./pages/consultant/SettingsPage";
import AdminDashboard from "./pages/AdminDashboard";
import RFPDetails from "./pages/RFPDetails";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/airline-dashboard" element={<AirlineDashboard />} />
            <Route path="/airline-dashboard/rfps" element={<MyRFPsPage />} />
            <Route path="/airline-dashboard/rfps/:id" element={<RFPDetailPage />} />
            <Route path="/airline-dashboard/matches" element={<VendorMatchesPage />} />
            <Route path="/airline-dashboard/adoption" element={<AdoptionTrackerPage />} />
            <Route path="/airline-dashboard/settings" element={<SettingsPage />} />
            <Route path="/vendor-dashboard" element={<VendorDashboard />} />
            <Route path="/vendor-dashboard/proposals" element={<VendorProposalsPage />} />
            <Route path="/vendor-dashboard/analytics" element={<VendorAnalyticsPage />} />
            <Route path="/respond/:token" element={<VendorRespond />} />
            <Route path="/consultant-dashboard" element={<ConsultantDashboard />} />
            <Route path="/consultant-dashboard/audit/:id" element={<AuditDetailPage />} />
            <Route path="/consultant-dashboard/clients" element={<ClientsPage />} />
            <Route path="/consultant-dashboard/analytics" element={<ConsultantAnalyticsPage />} />
            <Route path="/consultant-dashboard/settings" element={<ConsultantSettingsPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/rfp/:id" element={<RFPDetails />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
