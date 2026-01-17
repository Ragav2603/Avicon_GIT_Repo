import { motion } from "framer-motion";
import { 
  Plane, 
  Store, 
  LineChart,
  Target,
  Clock,
  TrendingUp,
  Users,
  Briefcase
} from "lucide-react";

const PersonasSection = () => {
  const personas = [
    {
      id: "airline",
      icon: Plane,
      title: "Airline Managers",
      subtitle: "Digital Ops, Procurement & IT Leaders",
      color: "secondary",
      goals: [
        "Speed up the RFP process",
        "Find verified, qualified vendors",
        "Reduce noise from irrelevant pitches",
      ],
      painPoints: [
        "Traditional RFPs take months",
        "Hard to verify vendor claims",
        "Overwhelmed by sales emails",
      ],
    },
    {
      id: "vendor",
      icon: Store,
      title: "Aviation Vendors",
      subtitle: "Sales Directors & Product Leads",
      color: "accent",
      goals: [
        "Get qualified leads",
        "Showcase product capabilities",
        "Reduce time on dead-end RFPs",
      ],
      painPoints: [
        "Long sales cycles",
        "No feedback on lost RFPs",
        "Procurement red tape",
      ],
    },
    {
      id: "consultant",
      icon: LineChart,
      title: "Adoption Consultants",
      subtitle: "Digital Transformation Specialists",
      color: "warning",
      goals: [
        "Efficiently audit airline ops",
        "Generate data-driven reports",
        "Recommend evidence-based strategies",
      ],
      painPoints: [
        "Manual data gathering is slow",
        "Reporting is often subjective",
        "Need for standardized scoring",
      ],
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      secondary: { bg: "bg-secondary/10", text: "text-secondary", border: "border-secondary/30" },
      accent: { bg: "bg-accent/10", text: "text-accent", border: "border-accent/30" },
      warning: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/30" },
    };
    return colors[color] || colors.secondary;
  };

  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider">
            Built For You
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6">
            Solutions for{" "}
            <span className="gradient-text">Every Stakeholder</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Whether you're buying, selling, or consulting—we've got you covered.
          </p>
        </motion.div>

        {/* Personas Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {personas.map((persona, index) => {
            const colors = getColorClasses(persona.color);
            
            return (
              <motion.div
                key={persona.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className={`h-full bg-card rounded-2xl border ${colors.border} p-8 hover-lift`}>
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`w-14 h-14 rounded-xl ${colors.bg} flex items-center justify-center shrink-0`}>
                      <persona.icon className={`w-7 h-7 ${colors.text}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">
                        {persona.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {persona.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Goals */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className={`w-4 h-4 ${colors.text}`} />
                      <span className="text-sm font-semibold text-foreground">Goals</span>
                    </div>
                    <ul className="space-y-2">
                      {persona.goals.map((goal) => (
                        <li key={goal} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <TrendingUp className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pain Points */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className={`w-4 h-4 ${colors.text}`} />
                      <span className="text-sm font-semibold text-foreground">Pain Points</span>
                    </div>
                    <ul className="space-y-2">
                      {persona.painPoints.map((pain) => (
                        <li key={pain} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="w-4 h-4 flex items-center justify-center text-red-500 shrink-0">•</span>
                          {pain}
                        </li>
                      ))}
                    </ul>
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
