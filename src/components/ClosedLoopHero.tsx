import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Shield, Zap, Target, Sparkles } from "lucide-react";

const stages = [
  {
    id: 1,
    icon: FileText,
    label: "AI Drafting",
    description: "Upload Old Docs → New RFP",
    color: "secondary",
    position: "top",
  },
  {
    id: 2,
    icon: Shield,
    label: "Guardrails",
    description: "Deal Breakers → Compliance Check",
    color: "accent",
    position: "right",
  },
  {
    id: 3,
    icon: Zap,
    label: "Integration",
    description: "Vendor Selected → System Live",
    color: "warning",
    position: "bottom",
  },
  {
    id: 4,
    icon: Target,
    label: "Adoption & ROI",
    description: "Track usage against RFP promises",
    color: "secondary",
    position: "left",
    isHighlight: true,
  },
];

const ClosedLoopHero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden gradient-hero-bg">
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 dot-pattern opacity-40" />
      
      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(210 100% 52% / 0.08) 0%, transparent 70%)",
            top: "-10%",
            right: "-10%",
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(199 89% 48% / 0.06) 0%, transparent 70%)",
            bottom: "-5%",
            left: "-5%",
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-32 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Main content */}
          <div className="text-center mb-12">
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

          {/* Closed Loop Circular Diagram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative max-w-4xl mx-auto"
          >
            {/* Central Hub */}
            <div className="relative flex items-center justify-center">
              {/* Rotating Ring */}
              <motion.div
                className="absolute w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] lg:w-[500px] lg:h-[500px] rounded-full border-2 border-dashed border-secondary/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Static Gradient Ring */}
              <div 
                className="absolute w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] lg:w-[450px] lg:h-[450px] rounded-full"
                style={{
                  background: "conic-gradient(from 0deg, hsl(var(--secondary) / 0.1), hsl(var(--accent) / 0.1), hsl(var(--warning) / 0.1), hsl(var(--secondary) / 0.1))",
                }}
              />

              {/* Center Content */}
              <div className="relative z-10 w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] lg:w-[300px] lg:h-[300px] rounded-full bg-background border border-border shadow-2xl flex flex-col items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center shadow-lg">
                      <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-1">The Loop</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Procure → Prove → Repeat</p>
                  </div>
                </motion.div>
              </div>

              {/* Stage Nodes */}
              {stages.map((stage, index) => {
                const angle = (index * 90) - 90; // Start from top
                const radius = 180; // Distance from center
                const radiusSm = 220;
                const radiusLg = 280;
                
                return (
                  <motion.div
                    key={stage.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    className="absolute"
                    style={{
                      transform: `rotate(${angle}deg) translateY(-${radius}px) rotate(-${angle}deg)`,
                    }}
                  >
                    <div className={`group relative ${stage.isHighlight ? 'z-20' : 'z-10'}`}>
                      {/* Node Circle */}
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shadow-lg cursor-pointer transition-all duration-300 ${
                          stage.isHighlight 
                            ? 'bg-gradient-to-br from-secondary to-accent ring-4 ring-secondary/20' 
                            : 'bg-card border border-border hover:border-secondary/30'
                        }`}
                      >
                        <stage.icon className={`w-7 h-7 sm:w-8 sm:h-8 ${stage.isHighlight ? 'text-white' : 'text-secondary'}`} />
                      </motion.div>
                      
                      {/* Label */}
                      <div className={`absolute left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap text-center ${
                        stage.position === 'bottom' ? 'top-full' : 
                        stage.position === 'top' ? 'bottom-full mb-4 mt-0' : ''
                      }`}>
                        <p className={`text-sm sm:text-base font-semibold ${stage.isHighlight ? 'text-secondary' : 'text-foreground'}`}>
                          {stage.label}
                        </p>
                        <p className="text-xs text-muted-foreground hidden sm:block max-w-[140px]">
                          {stage.description}
                        </p>
                      </div>

                      {/* Highlight Badge for Adoption */}
                      {stage.isHighlight && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 }}
                          className="absolute -bottom-16 left-1/2 -translate-x-1/2 hidden lg:block"
                        >
                          <div className="px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20">
                            <p className="text-xs text-secondary font-medium">
                              ✨ The Differentiator
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Connecting Arrows */}
              <svg className="absolute w-full h-full pointer-events-none" viewBox="0 0 500 500">
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--secondary) / 0.3)" />
                  </marker>
                </defs>
                {/* Curved arrow paths */}
                <motion.path
                  d="M 250 80 A 170 170 0 0 1 420 250"
                  fill="none"
                  stroke="hsl(var(--secondary) / 0.2)"
                  strokeWidth="2"
                  strokeDasharray="8 4"
                  markerEnd="url(#arrowhead)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
                <motion.path
                  d="M 420 250 A 170 170 0 0 1 250 420"
                  fill="none"
                  stroke="hsl(var(--secondary) / 0.2)"
                  strokeWidth="2"
                  strokeDasharray="8 4"
                  markerEnd="url(#arrowhead)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.7 }}
                />
                <motion.path
                  d="M 250 420 A 170 170 0 0 1 80 250"
                  fill="none"
                  stroke="hsl(var(--secondary) / 0.2)"
                  strokeWidth="2"
                  strokeDasharray="8 4"
                  markerEnd="url(#arrowhead)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.9 }}
                />
                <motion.path
                  d="M 80 250 A 170 170 0 0 1 250 80"
                  fill="none"
                  stroke="hsl(var(--secondary) / 0.2)"
                  strokeWidth="2"
                  strokeDasharray="8 4"
                  markerEnd="url(#arrowhead)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 1.1 }}
                />
              </svg>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ClosedLoopHero;
