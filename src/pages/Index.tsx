import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar.tsx";
import ClosedLoopHero from "@/components/ClosedLoopHero.tsx";
import TrustedPartnersMarquee from "@/components/TrustedPartnersMarquee.tsx";
import { LoadingSpinner } from "@/components/ui/loading-spinner.tsx";

const SmartProcurementSection = lazy(() => import("@/components/SmartProcurementSection.tsx"));
const AIDocumentIntel = lazy(() => import("@/components/AIDocumentIntel.tsx"));
const DealBreakersSection = lazy(() => import("@/components/DealBreakersSection.tsx"));
const AdoptionROISection = lazy(() => import("@/components/AdoptionROISection.tsx"));
const HowItWorksSection = lazy(() => import("@/components/HowItWorksSection.tsx"));
const SecurityTrustStrip = lazy(() => import("@/components/SecurityTrustStrip.tsx"));
const PersonasSection = lazy(() => import("@/components/PersonasSection.tsx"));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection.tsx"));
const CTASection = lazy(() => import("@/components/CTASection.tsx"));
const AskAISection = lazy(() => import("@/components/AskAISection.tsx"));
const Footer = lazy(() => import("@/components/Footer.tsx"));

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ClosedLoopHero />
      <TrustedPartnersMarquee />

      <Suspense fallback={<div className="flex justify-center py-20"><LoadingSpinner className="h-10 w-10" /></div>}>
        <SmartProcurementSection />
        <AIDocumentIntel />
        <DealBreakersSection />
        <AdoptionROISection />
        <HowItWorksSection />
      </Suspense>

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
