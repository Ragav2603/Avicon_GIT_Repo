import React from "react";
import { Toaster } from "@/components/ui/toaster.tsx";
import { Toaster as Sonner } from "@/components/ui/sonner.tsx";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth.tsx";
import { Suspense, lazy } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner.tsx";
import ErrorBoundary from "@/components/ui/ErrorBoundary.tsx";

const Index = lazy(() => import("./pages/Index.tsx"));
const Auth = lazy(() => import("./pages/Auth.tsx"));
const Onboarding = lazy(() => import("./pages/Onboarding.tsx"));
const AirlineDashboard = lazy(() => import("./pages/AirlineDashboard.tsx"));
const MyRFPsPage = lazy(() => import("./pages/airline/MyRFPsPage.tsx"));
const RFPDetailPage = lazy(() => import("./pages/airline/RFPDetailPage.tsx"));
const ProjectDetailPage = lazy(() => import("./pages/airline/ProjectDetailPage.tsx"));
const VendorMatchesPage = lazy(() => import("./pages/airline/VendorMatchesPage.tsx"));
const AdoptionTrackerPage = lazy(() => import("./pages/airline/AdoptionTrackerPage.tsx"));
const SettingsPage = lazy(() => import("./pages/airline/SettingsPage.tsx"));
const VendorDashboard = lazy(() => import("./pages/VendorDashboard.tsx"));
const VendorProposalsPage = lazy(() => import("./pages/vendor/VendorProposalsPage.tsx"));
const VendorAnalyticsPage = lazy(() => import("./pages/vendor/VendorAnalyticsPage.tsx"));
const VendorSettingsPage = lazy(() => import("./pages/vendor/VendorSettingsPage.tsx"));
const VendorRespond = lazy(() => import("./pages/VendorRespond.tsx"));
const ConsultantDashboard = lazy(() => import("./pages/ConsultantDashboard.tsx"));
const AuditDetailPage = lazy(() => import("./pages/consultant/AuditDetailPage.tsx"));
const ClientsPage = lazy(() => import("./pages/consultant/ClientsPage.tsx"));
const ConsultantAnalyticsPage = lazy(() => import("./pages/consultant/AnalyticsPage.tsx"));
const ConsultantSettingsPage = lazy(() => import("./pages/consultant/SettingsPage.tsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.tsx"));
const RFPDetails = lazy(() => import("./pages/RFPDetails.tsx"));
const KnowledgeBase = lazy(() => import("./pages/KnowledgeBase.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 min stale time
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            {/* WCAG 2.1 AA: Skip to main content link */}
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            <Suspense fallback={<LoadingSpinner />}>
              <main id="main-content">
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
                  <Route path="/vendor-dashboard/settings" element={<VendorSettingsPage />} />
                  <Route path="/respond/:token" element={<VendorRespond />} />
                  <Route path="/consultant-dashboard" element={<ConsultantDashboard />} />
                  <Route path="/consultant-dashboard/audit/:id" element={<AuditDetailPage />} />
                  <Route path="/consultant-dashboard/clients" element={<ClientsPage />} />
                  <Route path="/consultant-dashboard/analytics" element={<ConsultantAnalyticsPage />} />
                  <Route path="/consultant-dashboard/settings" element={<ConsultantSettingsPage />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/rfp/:id" element={<RFPDetails />} />
                  <Route path="/knowledge-base" element={<KnowledgeBase />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
