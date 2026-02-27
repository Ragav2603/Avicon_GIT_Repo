import { FileText, Shield, Zap, TrendingUp } from "lucide-react";
import StaggerChildren from "@/components/StaggerChildren";

const stages = [
  {
    number: 1,
    title: "AI Drafting",
    description: "Upload Old Docs → New RFP",
    icon: FileText,
    targetId: "smart-procurement",
  },
  {
    number: 2,
    title: "Guardrails",
    description: "Deal Breakers → Compliance",
    icon: Shield,
    targetId: "deal-breakers",
  },
  {
    number: 3,
    title: "Integration",
    description: "Vendor Selected → Live",
    icon: Zap,
    targetId: "how-it-works",
  },
  {
    number: 4,
    title: "Adoption & ROI",
    description: "Track & Prove Value",
    icon: TrendingUp,
    targetId: "adoption-roi",
  },
];

const SmartProcurementSection = () => {
  const scrollToSection = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section 
      id="smart-procurement"
      className="py-24 lg:py-32 bg-background"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
            <Zap className="w-4 h-4" />
            The Differentiator
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
            One <span className="text-primary">Closed Loop</span> for Everything
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Click any stage to explore the details
          </p>
        </div>

        {/* Stages Grid — staggered */}
        <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4" staggerDelay={0.12}>
          {stages.map((stage) => {
            const IconComponent = stage.icon;

            return (
              <div key={stage.number} className="relative">
                <button
                  onClick={() => scrollToSection(stage.targetId)}
                  className="relative w-full text-left bg-card rounded-md border border-border p-6 transition-colors cursor-pointer hover:border-primary/30"
                >
                  {/* Stage Number Badge */}
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {stage.number}
                  </div>

                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-4">
                    <IconComponent className="w-7 h-7 text-primary" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {stage.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {stage.description}
                  </p>
                </button>
              </div>
            );
          })}
        </StaggerChildren>
      </div>
    </section>
  );
};

export default SmartProcurementSection;
