import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Suspense, lazy } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const AirlineDashboard = lazy(() => import("./pages/AirlineDashboard"));
const MyRFPsPage = lazy(() => import("./pages/airline/MyRFPsPage"));
const RFPDetailPage = lazy(() => import("./pages/airline/RFPDetailPage"));
const ProjectDetailPage = lazy(() => import("./pages/airline/ProjectDetailPage"));
const VendorMatchesPage = lazy(() => import("./pages/airline/VendorMatchesPage"));
const AdoptionTrackerPage = lazy(() => import("./pages/airline/AdoptionTrackerPage"));
const SettingsPage = lazy(() => import("./pages/airline/SettingsPage"));
const VendorDashboard = lazy(() => import("./pages/VendorDashboard"));
const VendorProposalsPage = lazy(() => import("./pages/vendor/VendorProposalsPage"));
const VendorAnalyticsPage = lazy(() => import("./pages/vendor/VendorAnalyticsPage"));
const VendorRespond = lazy(() => import("./pages/VendorRespond"));
const ConsultantDashboard = lazy(() => import("./pages/ConsultantDashboard"));
const AuditDetailPage = lazy(() => import("./pages/consultant/AuditDetailPage"));
const ClientsPage = lazy(() => import("./pages/consultant/ClientsPage"));
const ConsultantAnalyticsPage = lazy(() => import("./pages/consultant/AnalyticsPage"));
const ConsultantSettingsPage = lazy(() => import("./pages/consultant/SettingsPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const RFPDetails = lazy(() => import("./pages/RFPDetails"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/airline-dashboard" element={<AirlineDashboard />} />
              <Route path="/airline-dashboard/rfps" element={<MyRFPsPage />} />
              <Route path="/airline-dashboard/rfps/:id" element={<RFPDetailPage />} />
              <Route path="/airline-dashboard/projects/:id" element={<ProjectDetailPage />} />
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
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
