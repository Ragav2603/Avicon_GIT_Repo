import { motion } from "framer-motion";
import { Plane, Store, BarChart3, ArrowRight, CheckCircle } from "lucide-react";

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">
            Value Propositions
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6">
            Built for{" "}
            <span className="gradient-text">Every Stakeholder</span>
          </h2>
          <p className="text-secondary text-lg">
            Whether you're buying, selling, or measuring—we've got you covered.
          </p>
        </motion.div>

        {/* Personas Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {personas.map((persona, index) => {
            const Icon = persona.icon;
            
            return (
              <motion.div
                key={persona.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="h-full bg-card rounded-2xl border border-border p-8 transition-all duration-200 cursor-pointer hover:border-accent/30 hover:-translate-y-1 hover:shadow-lg">
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                      <Icon className="w-7 h-7 text-accent" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      {persona.title}
                    </h3>
                  </div>

                  {/* Tagline */}
                  <p className="text-lg font-medium text-foreground mb-6 leading-relaxed">
                    {persona.tagline}
                  </p>

                  {/* Benefits */}
                  <ul className="space-y-3">
                    {persona.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        {benefit}
                      </li>
                    ))}
                  </ul>

                  {/* Learn More Link */}
                  <div className="mt-6 pt-6 border-t border-border">
                    <button className="flex items-center gap-2 text-accent font-medium text-sm transition-all duration-200 cursor-pointer hover:gap-3">
                      Learn more
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PersonasSection;
