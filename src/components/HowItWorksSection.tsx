import { motion } from "framer-motion";
import { 
  ClipboardList, 
  Send, 
  Brain, 
  Award,
  Upload,
  Calculator,
  FileOutput,
  Lightbulb
} from "lucide-react";

const HowItWorksSection = () => {
  const rfpSteps = [
    {
      step: 1,
      icon: ClipboardList,
      title: "Post Your RFP",
      description: "Define requirements, budget, and timeline in our structured form.",
    },
    {
      step: 2,
      icon: Send,
      title: "Vendors Respond",
      description: "Qualified vendors submit proposals with MVP evidence.",
    },
    {
      step: 3,
      icon: Brain,
      title: "AI Analysis",
      description: "Our engine scores and ranks submissions automatically.",
    },
    {
      step: 4,
      icon: Award,
      title: "Review Shortlist",
      description: "Get your top 3 matches ready for demos.",
    },
  ];

  const adoptionSteps = [
    {
      step: 1,
      icon: Upload,
      title: "Input Data",
      description: "Enter audit data manually or upload CSV with tool metrics.",
    },
    {
      step: 2,
      icon: Calculator,
      title: "Calculate Scores",
      description: "System generates adoption scores for each tool.",
    },
    {
      step: 3,
      icon: Lightbulb,
      title: "Get Insights",
      description: "Decision logic determines optimal actions per tool.",
    },
    {
      step: 4,
      icon: FileOutput,
      title: "Export Report",
      description: "Download PDF or view dashboard with recommendations.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-muted/50">
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
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6">
            Simple Steps to{" "}
            <span className="gradient-text">Transform Your Ops</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Both products are designed for speed and clarity. 
            Get actionable results in days, not months.
          </p>
        </motion.div>

        {/* RFP Journey */}
        <div className="mb-24">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl lg:text-2xl font-bold text-center text-foreground mb-12"
          >
            🚀 RFP Marketplace Journey
          </motion.h3>

          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-secondary/20 via-secondary to-secondary/20 hidden lg:block" />
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {rfpSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="bg-card rounded-2xl p-6 border border-border hover:border-secondary/50 transition-colors relative z-10">
                    {/* Step Number */}
                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full gradient-accent-bg flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {step.step}
                    </div>
                    
                    <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                      <step.icon className="w-7 h-7 text-secondary" />
                    </div>
                    
                    <h4 className="text-lg font-semibold text-foreground mb-2">
                      {step.title}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Adoption Ops Journey */}
        <div>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl lg:text-2xl font-bold text-center text-foreground mb-12"
          >
            📊 Adoption Ops Journey
          </motion.h3>

          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-warning/20 via-warning to-warning/20 hidden lg:block" />
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {adoptionSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="bg-card rounded-2xl p-6 border border-border hover:border-warning/50 transition-colors relative z-10">
                    {/* Step Number */}
                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full gradient-warm-bg flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {step.step}
                    </div>
                    
                    <div className="w-14 h-14 rounded-xl bg-warning/10 flex items-center justify-center mb-4">
                      <step.icon className="w-7 h-7 text-warning" />
                    </div>
                    
                    <h4 className="text-lg font-semibold text-foreground mb-2">
                      {step.title}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
