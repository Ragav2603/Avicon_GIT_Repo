import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileSearch, Brain, CheckCircle, BarChart3, TrendingUp } from "lucide-react";

// Airline logos - using placeholder SVGs with airline colors
const airlines = [
  { name: "Emirates", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Emirates_logo.svg" },
  { name: "Lufthansa", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Lufthansa_Logo_2018.svg" },
  { name: "Singapore Airlines", logo: "https://upload.wikimedia.org/wikipedia/en/6/6b/Singapore_Airlines_Logo_2.svg" },
  { name: "Qatar Airways", logo: "https://upload.wikimedia.org/wikipedia/en/9/9b/Qatar_Airways_Logo.svg" },
  { name: "Etihad", logo: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Etihad-airways-logo.svg" },
  { name: "British Airways", logo: "https://upload.wikimedia.org/wikipedia/en/4/42/British_Airways_Logo.svg" },
  { name: "Air France", logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Air_France_Logo.svg" },
  { name: "KLM", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c7/KLM_logo.svg" },
];

const cycleSteps = [
  { icon: FileSearch, label: "Define Needs", color: "secondary" },
  { icon: Brain, label: "AI Verify", color: "secondary" },
  { icon: CheckCircle, label: "Select", color: "secondary" },
  { icon: BarChart3, label: "Track Adoption", color: "warning" },
  { icon: TrendingUp, label: "Verify ROI", color: "warning" },
];

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden gradient-hero-bg">
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 dot-pattern opacity-40" />
      
      {/* Gradient orbs - Light version */}
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
        <div className="max-w-5xl mx-auto">
          {/* Main content */}
          <div className="text-center mb-12">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-secondary text-sm font-medium">
                The Digital Integrity Loop
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-[1.1] mb-8 tracking-tight"
            >
              Procure with Confidence.{" "}
              <br className="hidden sm:block" />
              <span className="gradient-text">Adopt with Intelligence.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed"
            >
              The first platform that connects your RFP requirements to verified delivery 
              and long-term operational ROI.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <Button variant="hero" size="xl" className="group min-w-[220px]">
                Start Your First Loop
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="heroOutline" size="xl" className="min-w-[200px] border-secondary/30 text-secondary hover:bg-secondary/5">
                Request Demo
              </Button>
            </motion.div>
          </div>

          {/* Cycle Animation/Diagram */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative max-w-4xl mx-auto mb-16"
          >
            {/* Desktop: Horizontal cycle */}
            <div className="hidden md:block">
              <div className="relative flex items-center justify-between px-4">
                {/* Connecting line - dashed */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2">
                  <div className="w-full h-full border-t-2 border-dashed border-secondary/30" />
                </div>
                
                {/* Closing loop arrow */}
                <motion.div 
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <svg width="200" height="40" viewBox="0 0 200 40" fill="none" className="text-secondary/40">
                    <path 
                      d="M10 5 C10 25, 100 35, 190 5" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeDasharray="6 4"
                      fill="none"
                    />
                    <path d="M5 8 L10 2 L15 8" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                </motion.div>
                
                {cycleSteps.map((step, index) => (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                    className="relative z-10 flex flex-col items-center"
                  >
                    <motion.div
                      className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${
                        step.color === "secondary" 
                          ? "bg-secondary text-white" 
                          : "bg-warning text-white"
                      }`}
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.3,
                      }}
                    >
                      <step.icon className="w-6 h-6" />
                    </motion.div>
                    <span className="mt-3 text-sm font-medium text-foreground whitespace-nowrap">
                      {step.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Mobile: Vertical cycle */}
            <div className="md:hidden">
              <div className="relative flex flex-col items-center gap-4">
                {cycleSteps.map((step, index) => (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                    className="relative z-10 flex items-center gap-4 w-full max-w-xs"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 ${
                        step.color === "secondary" 
                          ? "bg-secondary text-white" 
                          : "bg-warning text-white"
                      }`}
                    >
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {step.label}
                    </span>
                    {index < cycleSteps.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-4 border-l-2 border-dashed border-secondary/30" />
                    )}
                  </motion.div>
                ))}
                {/* Loop back indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-xs text-muted-foreground flex items-center gap-2 mt-2"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-secondary/50">
                    <path d="M3 10 C3 5, 10 3, 17 10 M17 10 C17 15, 10 17, 3 10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
                  </svg>
                  <span>Continuous Loop</span>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Trust logos - Scrolling marquee */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-center"
          >
            <p className="text-muted-foreground text-sm mb-8 uppercase tracking-wider font-medium">
              Trusted by leading airlines worldwide
            </p>
            
            {/* Logo carousel container */}
            <div className="relative overflow-hidden mx-auto max-w-4xl">
              {/* Gradient masks for smooth fade effect */}
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
              
              {/* Scrolling logos */}
              <div className="flex animate-marquee">
                {[...airlines, ...airlines].map((airline, index) => (
                  <div
                    key={`${airline.name}-${index}`}
                    className="flex-shrink-0 mx-8 flex items-center justify-center h-12 w-32 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
                  >
                    <img
                      src={airline.logo}
                      alt={airline.name}
                      className="h-8 w-auto object-contain max-w-full"
                      onError={(e) => {
                        // Fallback to text if image fails
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `<span class="text-muted-foreground font-semibold text-lg">${airline.name}</span>`;
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
