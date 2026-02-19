import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import ClosedLoopHero from "@/components/ClosedLoopHero";
import TrustedPartnersMarquee from "@/components/TrustedPartnersMarquee";
import SectionConnector from "@/components/SectionConnector";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import SmartProcurementSection from "@/components/SmartProcurementSection";

// Lazy load below-the-fold components to improve initial load performance
// SmartProcurementSection is eager loaded to prevent layout shift and improve FID for the first below-the-fold section
const AIDocumentIntel = lazy(() => import("@/components/AIDocumentIntel"));
const DealBreakersSection = lazy(() => import("@/components/DealBreakersSection"));
const AdoptionROISection = lazy(() => import("@/components/AdoptionROISection"));
const SecurityTrustStrip = lazy(() => import("@/components/SecurityTrustStrip"));
const PersonasSection = lazy(() => import("@/components/PersonasSection"));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection"));
const CTASection = lazy(() => import("@/components/CTASection"));
const AskAISection = lazy(() => import("@/components/AskAISection"));
const Footer = lazy(() => import("@/components/Footer"));

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ClosedLoopHero />
      <TrustedPartnersMarquee />
      <SectionConnector />

      <SmartProcurementSection />

      {/* Group 1: Immediate follow-up sections */}
      <Suspense fallback={<div className="flex justify-center py-20"><LoadingSpinner className="h-10 w-10" /></div>}>
        <AIDocumentIntel />
        <DealBreakersSection />
        <AdoptionROISection />
      </Suspense>

      {/* Group 2: Lower sections and footer */}
      <Suspense fallback={<div className="flex justify-center py-20"><LoadingSpinner className="h-10 w-10" /></div>}>
        <SecurityTrustStrip />
        <PersonasSection />
        <TestimonialsSection />
        <CTASection />
        <AskAISection />
        <Footer />
      </Suspense>
    </div>
  );
};

export default Index;
