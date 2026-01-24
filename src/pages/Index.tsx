import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PersonasSection from "@/components/PersonasSection";
import CTASection from "@/components/CTASection";
import AskAISection from "@/components/AskAISection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PersonasSection />
      <CTASection />
      <AskAISection />
      <Footer />
    </div>
  );
};

export default Index;
