import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Shield, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";

const phases = [
  {
    id: 1,
    icon: FileText,
    label: "Smart Procurement",
    description: "AI-powered RFP creation & vendor matching",
    scrollTarget: "smart-procurement",
  },
  {
    id: 2,
    icon: Shield,
    label: "Verify & Select",
    description: "Go/No-Go guardrails & compliance checks",
    scrollTarget: "deal-breakers",
  },
  {
    id: 3,
    icon: BarChart3,
    label: "Adoption Tracker",
    description: "ROI measurement & adoption scoring",
    scrollTarget: "adoption-roi",
  },
];

const ClosedLoopHero = () => {
  const [activePhase, setActivePhase] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setActivePhase((prev) => (prev + 1) % phases.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePhaseClick = (index: number) => {
    setActivePhase(index);
    const targetId = phases[index].scrollTarget;
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden gradient-hero-bg">
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 dot-pattern opacity-30" />
      
      {/* Gradient accent orb */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, hsl(201 96% 32% / 0.15) 0%, transparent 60%)",
          top: "-20%",
          right: "-15%",
        }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-32 pb-16 relative z-10 max-w-7xl">
        <div className="max-w-6xl mx-auto">
          {/* Main content */}
          <div className="text-center mb-16">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8"
            >
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-accent text-sm font-medium">
                Enterprise-Grade Procurement Intelligence
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-[1.1] mb-6 tracking-tight"
            >
              Aviation's{" "}
              <span className="gradient-text">Digital Integrity</span>
              <br className="hidden sm:block" />
              Platform
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-secondary max-w-3xl mx-auto mb-12 leading-relaxed"
            >
              Shorten the distance between your RFP requirements and actual operational ROI.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
            >
              <Button 
                size="lg" 
                className="group min-w-[200px] bg-accent hover:bg-accent/90 text-accent-foreground transition-all duration-200 cursor-pointer"
              >
                Request Demo
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="min-w-[180px] border-border hover:bg-muted transition-all duration-200 cursor-pointer"
              >
                Watch Video
              </Button>
            </motion.div>
          </div>

          {/* Infinity Loop Diagram */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative max-w-4xl mx-auto"
          >
            {/* Desktop Horizontal Loop */}
            <div className="hidden lg:block relative">
              {/* SVG Infinity Loop Path */}
              <svg
                viewBox="0 0 800 200"
                className="w-full h-auto"
                fill="none"
              >
                {/* Loop path background */}
                <path
                  d="M100 100 C100 50, 200 50, 300 100 C400 150, 500 150, 600 100 C700 50, 700 50, 600 100 C500 150, 400 150, 300 100 C200 50, 100 50, 100 100"
                  stroke="hsl(214 32% 91%)"
                  strokeWidth="3"
                  fill="none"
                />
                
                {/* Animated flow indicator */}
                <motion.circle
                  r="6"
                  fill="hsl(201 96% 32%)"
                  animate={{
                    cx: [100, 300, 600, 300, 100],
                    cy: [100, 100, 100, 100, 100],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </svg>

              {/* Phase Cards positioned along the loop */}
              <div className="absolute inset-0 flex items-center justify-between px-8">
                {phases.map((phase, index) => {
                  const isActive = activePhase === index;
                  const Icon = phase.icon;
                  
                  return (
                    <motion.div
                      key={phase.id}
                      className={`relative p-6 rounded-2xl border-2 bg-card transition-all duration-200 cursor-pointer ${
                        isActive 
                          ? 'border-accent shadow-lg scale-105' 
                          : 'border-border hover:border-accent/30'
                      }`}
                      style={{ boxShadow: isActive ? 'var(--shadow-md)' : 'none' }}
                      onClick={() => handlePhaseClick(index)}
                      onMouseEnter={() => setIsPaused(true)}
                      onMouseLeave={() => setIsPaused(false)}
                      whileHover={{ y: -2 }}
                    >
                      {/* Phase number badge */}
                      <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isActive 
                          ? 'bg-accent text-accent-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {phase.id}
                      </div>
                      
                      <div className="flex flex-col items-center text-center w-40">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                          isActive ? 'bg-accent/10' : 'bg-muted'
                        }`}>
                          <Icon className={`w-7 h-7 ${isActive ? 'text-accent' : 'text-secondary'}`} />
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">{phase.label}</h3>
                        <p className="text-xs text-muted-foreground leading-tight">{phase.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Connecting arrows */}
              <div className="absolute top-1/2 left-[28%] -translate-y-1/2">
                <motion.div
                  className="w-8 h-0.5 bg-accent/30"
                  animate={{ scaleX: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div className="absolute top-1/2 right-[28%] -translate-y-1/2">
                <motion.div
                  className="w-8 h-0.5 bg-accent/30"
                  animate={{ scaleX: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
              </div>
            </div>

            {/* Mobile Vertical Layout */}
            <div className="lg:hidden space-y-4">
              {phases.map((phase, index) => {
                const isActive = activePhase === index;
                const Icon = phase.icon;
                
                return (
                  <motion.div
                    key={phase.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div
                      className={`p-5 rounded-xl border-2 bg-card transition-all duration-200 cursor-pointer ${
                        isActive 
                          ? 'border-accent shadow-md' 
                          : 'border-border'
                      }`}
                      onClick={() => handlePhaseClick(index)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          isActive ? 'bg-accent/10' : 'bg-muted'
                        }`}>
                          <Icon className={`w-6 h-6 ${isActive ? 'text-accent' : 'text-secondary'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                              isActive ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
                            }`}>
                              {phase.id}
                            </span>
                            <h3 className="font-semibold text-foreground">{phase.label}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{phase.description}</p>
                        </div>
                        <ArrowRight className={`w-5 h-5 ${isActive ? 'text-accent' : 'text-muted-foreground'}`} />
                      </div>
                    </div>
                    
                    {/* Connector line */}
                    {index < phases.length - 1 && (
                      <div className="flex justify-center py-2">
                        <motion.div 
                          className="w-0.5 h-6 bg-accent/20"
                          animate={{ scaleY: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Loop indicator dots */}
            <div className="flex justify-center gap-2 mt-8">
              {phases.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActivePhase(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 cursor-pointer ${
                    activePhase === index ? 'bg-accent w-6' : 'bg-border hover:bg-accent/50'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ClosedLoopHero;
