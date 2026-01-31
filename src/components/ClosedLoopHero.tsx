import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Shield, Zap, Target, Sparkles, ChevronRight } from "lucide-react";

const stages = [
  {
    id: 1,
    icon: FileText,
    label: "AI Drafting",
    description: "Upload Old Docs → New RFP",
  },
  {
    id: 2,
    icon: Shield,
    label: "Guardrails",
    description: "Deal Breakers → Compliance",
  },
  {
    id: 3,
    icon: Zap,
    label: "Integration",
    description: "Vendor Selected → Live",
  },
  {
    id: 4,
    icon: Target,
    label: "Adoption & ROI",
    description: "Track & Prove Value",
    isHighlight: true,
  },
];

const ClosedLoopHero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden gradient-hero-bg">
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 dot-pattern opacity-40" />
      
      {/* Gradient orbs - simplified */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, hsl(210 100% 52% / 0.15) 0%, transparent 70%)",
            top: "-10%",
            right: "-10%",
          }}
        />
        <div 
          className="absolute w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, hsl(199 89% 48% / 0.15) 0%, transparent 70%)",
            bottom: "-5%",
            left: "-5%",
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-32 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Main content */}
          <div className="text-center mb-16">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-8"
            >
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-secondary text-sm font-medium">
                The Closed Loop Platform
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-[1.1] mb-8 tracking-tight"
            >
              Most Platforms Stop When{" "}
              <br className="hidden sm:block" />
              <span className="text-muted-foreground">the Contract is Signed.</span>
            </motion.h1>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8"
            >
              <span className="gradient-text">AviCon Stops When the ROI is Met.</span>
            </motion.h2>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
            >
              The complete procurement-to-adoption lifecycle. From intelligent RFP drafting 
              to proving real-world ROI—we close the loop on every deal.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <Button variant="hero" size="xl" className="group min-w-[220px]">
                Request Access
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="heroOutline" size="xl" className="min-w-[200px] border-secondary/30 text-secondary hover:bg-secondary/5">
                Watch Demo
              </Button>
            </motion.div>
          </div>

          {/* Closed Loop Flow Diagram - Horizontal Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative max-w-5xl mx-auto"
          >
            {/* Flow Container */}
            <div className="relative">
              {/* Background connecting line */}
              <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-secondary/20 via-accent/20 to-warning/20 -translate-y-1/2 rounded-full" />
              
              {/* Stage Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {stages.map((stage, index) => (
                  <motion.div
                    key={stage.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    className="relative"
                  >
                    {/* Arrow between cards (desktop only) */}
                    {index < stages.length - 1 && (
                      <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20">
                        <motion.div
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.2 }}
                        >
                          <ChevronRight className="w-6 h-6 text-secondary/50" />
                        </motion.div>
                      </div>
                    )}
                    
                    {/* Card */}
                    <div 
                      className={`relative p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                        stage.isHighlight 
                          ? 'bg-gradient-to-br from-secondary/10 to-accent/10 border-secondary/30 shadow-lg shadow-secondary/10' 
                          : 'bg-card border-border hover:border-secondary/30'
                      }`}
                    >
                      {/* Step Number */}
                      <div className={`absolute -top-3 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        stage.isHighlight 
                          ? 'bg-gradient-to-br from-secondary to-accent text-white' 
                          : 'bg-muted border border-border text-foreground'
                      }`}>
                        {stage.id}
                      </div>

                      {/* Icon */}
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                        stage.isHighlight 
                          ? 'bg-secondary/20' 
                          : 'bg-muted'
                      }`}>
                        <stage.icon className={`w-7 h-7 ${stage.isHighlight ? 'text-secondary' : 'text-foreground'}`} />
                      </div>

                      {/* Content */}
                      <h3 className={`text-lg font-semibold mb-2 ${stage.isHighlight ? 'text-secondary' : 'text-foreground'}`}>
                        {stage.label}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {stage.description}
                      </p>

                      {/* Highlight Badge */}
                      {stage.isHighlight && (
                        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20">
                          <Sparkles className="w-3 h-3 text-secondary" />
                          <span className="text-xs font-medium text-secondary">The Differentiator</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Loop Back Arrow */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="hidden lg:block mt-6"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-secondary/30 to-secondary/30" />
                  <div className="px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20">
                    <span className="text-sm font-medium text-secondary">↺ Continuous Improvement Loop</span>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-secondary/30 via-secondary/30 to-transparent" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ClosedLoopHero;
