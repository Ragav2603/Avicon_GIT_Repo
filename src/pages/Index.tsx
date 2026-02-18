import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import ClosedLoopHero from "@/components/ClosedLoopHero";
import TrustedPartnersMarquee from "@/components/TrustedPartnersMarquee";
import SectionConnector from "@/components/SectionConnector";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Lazy load below-the-fold components to improve initial load performance
const SmartProcurementSection = lazy(() => import("@/components/SmartProcurementSection"));
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

      {/* Wrap lazy-loaded components in Suspense with a lightweight fallback */}
      <Suspense fallback={<div className="flex justify-center py-20"><LoadingSpinner className="h-10 w-10" /></div>}>
        <SmartProcurementSection />
        <AIDocumentIntel />
        <DealBreakersSection />
        <AdoptionROISection />
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
