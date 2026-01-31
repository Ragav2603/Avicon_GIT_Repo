import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SectionConnector from "@/components/SectionConnector";
import GoNoGoSection from "@/components/GoNoGoSection";
import SecurityTrustStrip from "@/components/SecurityTrustStrip";
import LifecycleDashboard from "@/components/LifecycleDashboard";
import FeaturesSection from "@/components/FeaturesSection";
import PersonasSection from "@/components/PersonasSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import AskAISection from "@/components/AskAISection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <SectionConnector />
      <GoNoGoSection />
      <SecurityTrustStrip />
      <LifecycleDashboard />
      <FeaturesSection />
      <PersonasSection />
      <TestimonialsSection />
      <CTASection />
      <AskAISection />
      <Footer />
    </div>
  );
};

export default Index;
