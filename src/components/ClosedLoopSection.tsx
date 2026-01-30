import { motion } from "framer-motion";
import { FileSearch, Users, BarChart3, CheckCircle } from "lucide-react";
import { useState } from "react";

const steps = [
  {
    step: 1,
    icon: FileSearch,
    title: "The Filter",
    subtitle: "Marketplace",
    description: "Our AI reads your RFP and mathematically validates vendor claims before you even see them.",
    color: "secondary",
    angle: -45,
  },
  {
    step: 2,
    icon: Users,
    title: "The Choice",
    subtitle: "Selection",
    description: "Select the perfect partner based on data, not sales pitches. Evidence-backed scoring ensures the right fit.",
    color: "secondary",
    angle: 45,
  },
  {
    step: 3,
    icon: BarChart3,
    title: "The Reality Check",
    subtitle: "Adoption Ops",
    description: "Six months later, is it working? We track real-time adoption metrics to prove value or flag issues.",
    color: "warning",
    angle: 135,
  },
  {
    step: 4,
    icon: CheckCircle,
    title: "The Loop Closes",
    subtitle: "ROI Verified",
    description: "Adoption data feeds back into future RFPs. Every contract teaches the next procurement cycle.",
    color: "warning",
    angle: 225,
  },
];

const ClosedLoopSection = () => {
  const [activeStep, setActiveStep] = useState(0);
  const activeData = steps[activeStep];

  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-muted/30 relative overflow-hidden">
      {/* Subtle background accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-secondary/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-warning/5 blur-3xl" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary font-medium text-sm mb-6">
            The Complete Journey
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
            The Digital Integrity{" "}
            <span className="gradient-text">Loop</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Procurement doesn't end when a vendor is selected—it ends when ROI is verified.
          </p>
        </motion.div>

        {/* Circular Loop Diagram */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20">
          {/* Circle Diagram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] lg:w-[420px] lg:h-[420px]"
          >
            {/* Outer ring with gradient */}
            <div className="absolute inset-0 rounded-full border-4 border-dashed border-secondary/20" />
            
            {/* Animated rotating ring */}
            <motion.div
              className="absolute inset-2 rounded-full"
              style={{
                background: `conic-gradient(from 0deg, hsl(var(--secondary) / 0.15), hsl(var(--warning) / 0.15), hsl(var(--secondary) / 0.15))`,
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Inner circle */}
            <div className="absolute inset-8 sm:inset-10 lg:inset-12 rounded-full bg-card border border-border shadow-lg flex items-center justify-center">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center px-4"
              >
                <div className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center ${
                  activeData.color === "secondary" 
                    ? "bg-secondary/10 text-secondary" 
                    : "bg-warning/10 text-warning"
                }`}>
                  <activeData.icon className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <span className={`text-xs font-medium uppercase tracking-wider ${
                  activeData.color === "secondary" ? "text-secondary" : "text-warning"
                }`}>
                  {activeData.subtitle}
                </span>
                <h4 className="text-lg sm:text-xl font-bold text-foreground mt-1">
                  {activeData.title}
                </h4>
              </motion.div>
            </div>

            {/* Step nodes around the circle */}
            {steps.map((step, index) => {
              const angleRad = (step.angle * Math.PI) / 180;
              const radius = 42; // percentage from center
              const x = 50 + radius * Math.cos(angleRad);
              const y = 50 + radius * Math.sin(angleRad);
              const isActive = index === activeStep;
              
              return (
                <motion.button
                  key={step.step}
                  className={`absolute w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 shadow-lg cursor-pointer ${
                    isActive
                      ? step.color === "secondary"
                        ? "bg-secondary text-secondary-foreground scale-110"
                        : "bg-warning text-warning-foreground scale-110"
                      : "bg-card text-muted-foreground border border-border hover:border-secondary/50"
                  }`}
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: `translate(-50%, -50%) ${isActive ? 'scale(1.1)' : 'scale(1)'}`,
                  }}
                  onClick={() => setActiveStep(index)}
                  whileHover={{ scale: isActive ? 1.1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {step.step}
                </motion.button>
              );
            })}

            {/* Connecting arrows */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="6"
                  markerHeight="6"
                  refX="3"
                  refY="3"
                  orient="auto"
                >
                  <path d="M0,0 L0,6 L6,3 z" fill="hsl(var(--secondary) / 0.4)" />
                </marker>
              </defs>
              {/* Curved path showing flow direction */}
              <path
                d="M 80 20 A 35 35 0 0 1 80 80"
                fill="none"
                stroke="hsl(var(--secondary) / 0.3)"
                strokeWidth="0.5"
                strokeDasharray="2 2"
                markerEnd="url(#arrowhead)"
              />
              <path
                d="M 80 80 A 35 35 0 0 1 20 80"
                fill="none"
                stroke="hsl(var(--warning) / 0.3)"
                strokeWidth="0.5"
                strokeDasharray="2 2"
                markerEnd="url(#arrowhead)"
              />
              <path
                d="M 20 80 A 35 35 0 0 1 20 20"
                fill="none"
                stroke="hsl(var(--warning) / 0.3)"
                strokeWidth="0.5"
                strokeDasharray="2 2"
                markerEnd="url(#arrowhead)"
              />
              <path
                d="M 20 20 A 35 35 0 0 1 80 20"
                fill="none"
                stroke="hsl(var(--secondary) / 0.3)"
                strokeWidth="0.5"
                strokeDasharray="2 2"
                markerEnd="url(#arrowhead)"
              />
            </svg>
          </motion.div>

          {/* Description Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-md"
          >
            {/* Step indicators */}
            <div className="flex gap-2 mb-6">
              {steps.map((step, index) => (
                <button
                  key={step.step}
                  onClick={() => setActiveStep(index)}
                  className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                    index === activeStep
                      ? step.color === "secondary" ? "bg-secondary" : "bg-warning"
                      : "bg-border hover:bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>

            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  activeData.color === "secondary" 
                    ? "bg-secondary/10 text-secondary" 
                    : "bg-warning/10 text-warning"
                }`}>
                  Step {activeData.step}
                </span>
                <span className="text-muted-foreground text-sm">
                  {activeData.subtitle}
                </span>
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                {activeData.title}
              </h3>
              
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                {activeData.description}
              </p>

              {/* Navigation buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveStep((prev) => (prev - 1 + steps.length) % steps.length)}
                  className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setActiveStep((prev) => (prev + 1) % steps.length)}
                  className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
                >
                  Next →
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Loop closure message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 flex justify-center"
        >
          <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-secondary/10 via-warning/10 to-secondary/10 rounded-full border border-secondary/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-secondary">
              <path 
                d="M12 2 C6.5 2 2 6.5 2 12 C2 17.5 6.5 22 12 22 C17.5 22 22 17.5 22 12" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round"
                strokeDasharray="4 3"
              />
              <path d="M22 12 L22 2 L12 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm font-semibold text-foreground">
              Every cycle learns from the last
            </span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-warning">
              <path 
                d="M12 22 C17.5 22 22 17.5 22 12 C22 6.5 17.5 2 12 2 C6.5 2 2 6.5 2 12" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round"
                strokeDasharray="4 3"
              />
              <path d="M2 12 L2 22 L12 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ClosedLoopSection;
