import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Shield, Zap, Target, Sparkles, MousePointer2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const stages = [
  {
    id: 1,
    icon: FileText,
    label: "AI Drafting",
    scrollTarget: "smart-procurement",
    description: "Upload Old Docs → New RFP",
    color: "secondary",
  },
  {
    id: 2,
    icon: Shield,
    label: "Guardrails",
    description: "Deal Breakers → Compliance",
    color: "accent",
    scrollTarget: "deal-breakers",
  },
  {
    id: 3,
    icon: Zap,
    label: "Integration",
    description: "Vendor Selected → Live",
    color: "warning",
    scrollTarget: "personas",
  },
  {
    id: 4,
    icon: Target,
    label: "Adoption & ROI",
    description: "Track & Prove Value",
    color: "secondary",
    isHighlight: true,
    scrollTarget: "adoption-roi",
  },
];

// Interactive 3D Card Component
const InteractiveCard = ({ stage, index, isActive, onClick, onHoverStart, onHoverEnd }: { 
  stage: typeof stages[0]; 
  index: number; 
  isActive: boolean;
  onClick: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(y, [-100, 100], [10, -10]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-10, 10]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const colorClasses = {
    secondary: {
      glow: "shadow-[0_0_40px_-10px_hsl(var(--secondary)/0.5)]",
      border: "border-secondary/40",
      iconBg: "bg-secondary/20",
      iconColor: "text-secondary",
      activeBg: "from-secondary/20 via-secondary/10 to-transparent",
    },
    accent: {
      glow: "shadow-[0_0_40px_-10px_hsl(var(--accent)/0.5)]",
      border: "border-accent/40",
      iconBg: "bg-accent/20",
      iconColor: "text-accent",
      activeBg: "from-accent/20 via-accent/10 to-transparent",
    },
    warning: {
      glow: "shadow-[0_0_40px_-10px_hsl(var(--warning)/0.5)]",
      border: "border-warning/40",
      iconBg: "bg-warning/20",
      iconColor: "text-warning",
      activeBg: "from-warning/20 via-warning/10 to-transparent",
    },
  };

  const colors = colorClasses[stage.color as keyof typeof colorClasses];
  const Icon = stage.icon;

  return (
    <motion.div
      ref={cardRef}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={(e) => {
        handleMouseLeave();
        onHoverEnd();
      }}
      onMouseEnter={onHoverStart}
      onClick={onClick}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className={`relative cursor-pointer perspective-1000 ${isActive ? 'z-10' : 'z-0'}`}
    >
      {/* Animated border glow */}
      <motion.div
        className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r opacity-0 blur-sm transition-opacity duration-300 ${
          stage.color === 'secondary' ? 'from-secondary via-secondary/50 to-secondary' :
          stage.color === 'accent' ? 'from-accent via-accent/50 to-accent' :
          'from-warning via-warning/50 to-warning'
        }`}
        animate={{ opacity: isActive ? 0.6 : 0 }}
      />
      
      {/* Card */}
      <div 
        className={`relative p-6 rounded-2xl border bg-card/80 backdrop-blur-sm transition-all duration-300 ${
          isActive ? `${colors.glow} ${colors.border}` : 'border-border hover:border-muted-foreground/30'
        } ${stage.isHighlight ? 'ring-2 ring-secondary/20' : ''}`}
        style={{ transform: "translateZ(20px)" }}
      >
        {/* Floating particles effect when active */}
        {isActive && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-1 h-1 rounded-full ${colors.iconBg}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: [0, (i - 1) * 30],
                  y: [0, -40 - i * 10],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </>
        )}

        {/* Step Number Badge */}
        <motion.div 
          className={`absolute -top-3 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${
            stage.isHighlight 
              ? 'bg-gradient-to-br from-secondary to-accent text-white' 
              : 'bg-muted border border-border text-foreground'
          }`}
          animate={isActive ? { 
            scale: [1, 1.15, 1],
            rotate: [0, 5, -5, 0],
          } : {}}
          transition={{ duration: 0.6, repeat: isActive ? Infinity : 0, repeatDelay: 2 }}
        >
          {stage.id}
        </motion.div>

        {/* Icon with pulse effect */}
        <motion.div
          className={`relative w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${colors.iconBg}`}
          animate={isActive ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
        >
          {isActive && (
            <motion.div
              className={`absolute inset-0 rounded-xl ${colors.iconBg}`}
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
          <Icon className={`w-7 h-7 ${colors.iconColor} relative z-10`} />
        </motion.div>

        {/* Content */}
        <h3 className={`text-lg font-semibold mb-2 ${isActive ? colors.iconColor : 'text-foreground'}`}>
          {stage.label}
        </h3>
        <p className="text-sm text-muted-foreground">
          {stage.description}
        </p>

        {/* Highlight Badge */}
        {stage.isHighlight && (
          <motion.div 
            className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-3 h-3 text-secondary" />
            <span className="text-xs font-medium text-secondary">The Differentiator</span>
          </motion.div>
        )}

        {/* Click hint */}
        <motion.div
          className={`absolute bottom-2 right-2 flex items-center gap-1 text-xs ${colors.iconColor} opacity-0`}
          animate={{ opacity: isActive ? 0 : [0, 0.6, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        >
          <MousePointer2 className="w-3 h-3" />
        </motion.div>
      </div>
    </motion.div>
  );
};

// Animated connection line between cards
const ConnectionLine = ({ isActive, index }: { isActive: boolean; index: number }) => (
  <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 items-center">
    <svg width="24" height="40" viewBox="0 0 24 40" className="overflow-visible">
      {/* Base line */}
      <motion.path
        d="M0 20 Q12 20 24 20"
        fill="none"
        stroke="hsl(var(--border))"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Animated line */}
      <motion.path
        d="M0 20 Q12 20 24 20"
        fill="none"
        stroke="hsl(var(--secondary))"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ 
          pathLength: isActive ? 1 : 0, 
          opacity: isActive ? 1 : 0 
        }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
      {/* Traveling dot */}
      {isActive && (
        <motion.circle
          r="3"
          fill="hsl(var(--secondary))"
          initial={{ offsetDistance: "0%" }}
          animate={{ offsetDistance: "100%" }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{ offsetPath: "path('M0 20 Q12 20 24 20')" }}
        />
      )}
    </svg>
  </div>
);

const ClosedLoopHero = () => {
  const [activeStage, setActiveStage] = useState<number | null>(null);
  const [autoPlayActive, setAutoPlayActive] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-cycle through stages with pause on hover
  useEffect(() => {
    if (!autoPlayActive || isPaused) return;
    
    const interval = setInterval(() => {
      setActiveStage(prev => {
        if (prev === null) return 0;
        return (prev + 1) % stages.length;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [autoPlayActive, isPaused]);

  const handleCardClick = (index: number) => {
    setAutoPlayActive(false);
    setActiveStage(index);
    
    // Smooth scroll to the corresponding section
    const targetId = stages[index].scrollTarget;
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleHoverStart = () => {
    setIsPaused(true);
  };

  const handleHoverEnd = () => {
    setIsPaused(false);
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden gradient-hero-bg">
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 dot-pattern opacity-40" />
      
      {/* Animated gradient orbs that respond to active stage */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute w-[600px] h-[600px] rounded-full"
          animate={{
            opacity: activeStage === 0 || activeStage === 3 ? 0.4 : 0.2,
            scale: activeStage === 0 || activeStage === 3 ? 1.1 : 1,
          }}
          transition={{ duration: 1 }}
          style={{
            background: "radial-gradient(circle, hsl(var(--secondary) / 0.15) 0%, transparent 70%)",
            top: "-10%",
            right: "-10%",
          }}
        />
        <motion.div 
          className="absolute w-[500px] h-[500px] rounded-full"
          animate={{
            opacity: activeStage === 1 ? 0.35 : 0.15,
            scale: activeStage === 1 ? 1.1 : 1,
          }}
          transition={{ duration: 1 }}
          style={{
            background: "radial-gradient(circle, hsl(var(--accent) / 0.15) 0%, transparent 70%)",
            bottom: "-5%",
            left: "-5%",
          }}
        />
        <motion.div 
          className="absolute w-[400px] h-[400px] rounded-full"
          animate={{
            opacity: activeStage === 2 ? 0.35 : 0.1,
            scale: activeStage === 2 ? 1.1 : 1,
          }}
          transition={{ duration: 1 }}
          style={{
            background: "radial-gradient(circle, hsl(var(--warning) / 0.15) 0%, transparent 70%)",
            top: "30%",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-32 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Main content */}
          <div className="text-center mb-16">
            {/* Interactive Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-8 cursor-default group"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4 text-secondary" />
              </motion.div>
              <span className="text-secondary text-sm font-medium">
                The Closed Loop Platform
              </span>
              <motion.div
                className="w-2 h-2 rounded-full bg-secondary"
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
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

          {/* Interactive Closed Loop Flow Diagram */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative max-w-5xl mx-auto"
          >
            {/* Flow Container */}
            <div className="relative">
              {/* Animated progress line - Desktop */}
              <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 rounded-full overflow-hidden">
                {/* Base track */}
                <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 via-accent/10 to-warning/10" />
                {/* Animated progress */}
                <motion.div
                  className="h-full bg-gradient-to-r from-secondary via-accent to-warning"
                  initial={{ scaleX: 0 }}
                  animate={{ 
                    scaleX: activeStage !== null ? (activeStage + 1) / stages.length : 0 
                  }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{ transformOrigin: "left" }}
                />
              </div>
              
              {/* Stage Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {stages.map((stage, index) => (
                  <div key={stage.id} className="relative">
                    {/* Connection Line */}
                    {index < stages.length - 1 && (
                      <ConnectionLine 
                        isActive={activeStage !== null && activeStage >= index} 
                        index={index}
                      />
                    )}
                    
                    <InteractiveCard
                      stage={stage}
                      index={index}
                      isActive={activeStage === index}
                      onClick={() => handleCardClick(index)}
                      onHoverStart={handleHoverStart}
                      onHoverEnd={handleHoverEnd}
                    />

                    {/* Mobile Arrow */}
                    {index < stages.length - 1 && (
                      <motion.div
                        className="lg:hidden flex justify-center py-4"
                        animate={{ 
                          y: [0, 4, 0],
                          opacity: activeStage === index ? 1 : 0.5,
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className={`w-5 h-5 rotate-90 ${
                          activeStage === index ? 'text-secondary' : 'text-muted-foreground'
                        }`} />
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>

              {/* Interactive Loop indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="hidden lg:block mt-8"
              >
                <div className="flex items-center justify-center gap-3">
                  <motion.div 
                    className="flex-1 h-px"
                    style={{
                      background: "linear-gradient(to right, transparent, hsl(var(--secondary) / 0.3))",
                    }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <motion.button
                    onClick={() => {
                      setAutoPlayActive(!autoPlayActive);
                      if (!autoPlayActive) setActiveStage(null);
                    }}
                    className="px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 hover:bg-secondary/20 transition-colors cursor-pointer group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-sm font-medium text-secondary flex items-center gap-2">
                      <motion.span
                        animate={{ rotate: autoPlayActive ? 360 : 0 }}
                        transition={{ duration: 2, repeat: autoPlayActive ? Infinity : 0, ease: "linear" }}
                      >
                        ↺
                      </motion.span>
                      Continuous Improvement Loop
                      <span className={`w-2 h-2 rounded-full ${autoPlayActive ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                    </span>
                  </motion.button>
                  <motion.div 
                    className="flex-1 h-px"
                    style={{
                      background: "linear-gradient(to left, transparent, hsl(var(--secondary) / 0.3))",
                    }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                  />
                </div>
              </motion.div>

              {/* Stage indicator dots */}
              <div className="flex justify-center gap-2 mt-6 lg:hidden">
                {stages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleCardClick(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      activeStage === index 
                        ? 'bg-secondary scale-125' 
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ClosedLoopHero;
