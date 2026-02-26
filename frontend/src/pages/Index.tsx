import { lazy, Suspense, useState, useEffect } from "react";
import Navbar from "@/components/Navbar.tsx";
import ClosedLoopHero from "@/components/ClosedLoopHero.tsx";
import TrustedPartnersMarquee from "@/components/TrustedPartnersMarquee.tsx";
import { LoadingSpinner } from "@/components/ui/loading-spinner.tsx";
import { ArrowUp } from "lucide-react";
import SmoothScrollProvider from "@/components/SmoothScrollProvider.tsx";
import ScrollReveal from "@/components/ScrollReveal.tsx";

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
const AIExtractionShowcase = lazy(() => import("@/components/AIExtractionShowcase.tsx"));
const FAQSection = lazy(() => import("@/components/FAQSection.tsx"));
const Footer = lazy(() => import("@/components/Footer.tsx"));
const ScrollExperience = lazy(() => import("@/components/ScrollExperience.tsx"));

const Index = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <ClosedLoopHero />

        <ScrollReveal>
          <TrustedPartnersMarquee />
        </ScrollReveal>

        <Suspense fallback={<div className="flex justify-center py-20"><LoadingSpinner className="h-10 w-10" /></div>}>
          <ScrollReveal>
            <SmartProcurementSection />
          </ScrollReveal>
          <ScrollReveal direction="left" delay={0.1}>
            <AIDocumentIntel />
          </ScrollReveal>
          <ScrollReveal>
            <DealBreakersSection />
          </ScrollReveal>
          <ScrollReveal direction="right" delay={0.1}>
            <AdoptionROISection />
          </ScrollReveal>
          <div className="bg-aviation">
            <ScrollReveal direction="none">
              <ScrollExperience />
            </ScrollReveal>
          </div>
          <ScrollReveal>
            <HowItWorksSection />
          </ScrollReveal>
        </Suspense>

        <Suspense fallback={<div className="flex justify-center py-20"><LoadingSpinner className="h-10 w-10" /></div>}>
          <ScrollReveal direction="none">
            <SecurityTrustStrip />
          </ScrollReveal>
          <ScrollReveal>
            <PersonasSection />
          </ScrollReveal>
          <ScrollReveal>
            <TestimonialsSection />
          </ScrollReveal>
          <ScrollReveal>
            <CTASection />
          </ScrollReveal>
          <ScrollReveal direction="left">
            <AIExtractionShowcase />
          </ScrollReveal>
          <ScrollReveal>
            <FAQSection />
          </ScrollReveal>
          <ScrollReveal>
            <AskAISection />
          </ScrollReveal>
          <Footer />
        </Suspense>

        {/* Scroll to top button */}
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        )}
      </div>
    </SmoothScrollProvider>
  );
};

export default Index;
