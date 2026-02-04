import Navbar from "@/components/Navbar";
import ClosedLoopHero from "@/components/ClosedLoopHero";
import SectionConnector from "@/components/SectionConnector";
import SmartProcurementSection from "@/components/SmartProcurementSection";
import AIDocumentIntel from "@/components/AIDocumentIntel";
import DealBreakersSection from "@/components/DealBreakersSection";
import AdoptionROISection from "@/components/AdoptionROISection";
import SecurityTrustStrip from "@/components/SecurityTrustStrip";
import PersonasSection from "@/components/PersonasSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import AskAISection from "@/components/AskAISection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ClosedLoopHero />
      <SectionConnector />
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
    </div>
  );
};

export default Index;
