import { Plane, Store, BarChart3, ArrowRight, CheckCircle } from "lucide-react";
import StaggerChildren from "@/components/StaggerChildren";

const PersonasSection = () => {
  const personas = [
    {
      id: "airline",
      icon: Plane,
      title: "For Airlines",
      tagline: "Launch RFPs in minutes, not months. Trust the scoring.",
      benefits: [
        "AI extracts requirements from legacy documents",
        "Automated vendor matching & compliance checks",
        "Real-time proposal tracking & scoring",
      ],
    },
    {
      id: "vendor",
      icon: Store,
      title: "For Vendors",
      tagline: "Stop bidding on static. Bid on verified matches.",
      benefits: [
        "Smart opportunity radar with match scoring",
        "AI-powered proposal drafting from past wins",
        "Gap analysis before you invest time",
      ],
    },
    {
      id: "roi",
      icon: BarChart3,
      title: "For ROI",
      tagline: "Close the loop. Track how your procured tech actually performs.",
      benefits: [
        "Commitment vs Reality tracking",
        "Adoption scoring & utilization metrics",
        "Evidence-based vendor performance data",
      ],
    },
  ];

  return (
    <section id="personas" className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">
            Value Propositions
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6">
            Built for{" "}
            <span className="text-primary">Every Stakeholder</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Whether you're buying, selling, or measuring—we've got you covered.
          </p>
        </div>

        {/* Personas Grid — staggered */}
        <StaggerChildren className="grid lg:grid-cols-3 gap-8" staggerDelay={0.18}>
          {personas.map((persona) => {
            const Icon = persona.icon;
            
            return (
              <div key={persona.id}>
                <div className="h-full bg-card rounded-md border border-border p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                      <Icon className="w-7 h-7 text-accent" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      {persona.title}
                    </h3>
                  </div>

                  <p className="text-lg font-medium text-foreground mb-6 leading-relaxed">
                    {persona.tagline}
                  </p>

                  <ul className="space-y-3">
                    {persona.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        {benefit}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 pt-6 border-t border-border">
                    <button className="flex items-center gap-2 text-accent font-medium text-sm cursor-pointer hover:gap-3 transition-all">
                      Learn more
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </StaggerChildren>
      </div>
    </section>
  );
};

export default PersonasSection;
