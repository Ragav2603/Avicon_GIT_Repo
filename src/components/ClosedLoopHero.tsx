import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Shield, BarChart3 } from "lucide-react";

const phases = [
  {
    icon: FileText,
    label: "Smart Procurement",
    description: "AI-powered RFP creation & vendor matching",
    scrollTarget: "smart-procurement",
  },
  {
    icon: Shield,
    label: "Verify & Select",
    description: "Go/No-Go guardrails & compliance checks",
    scrollTarget: "deal-breakers",
  },
  {
    icon: BarChart3,
    label: "Adoption Tracker",
    description: "ROI measurement & adoption scoring",
    scrollTarget: "adoption-roi",
  },
];

const ClosedLoopHero = () => {
  const handlePhaseClick = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="max-w-6xl mx-auto">
          {/* Main content */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-[1.1] mb-6 tracking-tight">
              Aviation's{" "}
              <span className="text-primary">Digital Integrity</span>
              <br className="hidden sm:block" />
              {" "}Platform
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
              Shorten the distance between your RFP requirements and actual operational ROI.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
              <Button size="lg" className="min-w-[200px]">
                Request Demo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="min-w-[180px]">
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Static feature cards */}
          <div className="grid lg:grid-cols-3 gap-6">
            {phases.map((phase) => {
              const Icon = phase.icon;
              return (
                <button
                  key={phase.label}
                  onClick={() => handlePhaseClick(phase.scrollTarget)}
                  className="text-left bg-card border border-border rounded-md p-6 hover:border-primary/30 transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{phase.label}</h3>
                  <p className="text-sm text-muted-foreground">{phase.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClosedLoopHero;
