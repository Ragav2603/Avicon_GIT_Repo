import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Shield, BarChart3, Sparkles } from "lucide-react";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import StaggerChildren from "@/components/StaggerChildren";

const phases = [
  {
    icon: FileText,
    label: "Smart Procurement",
    description: "AI-powered RFP creation & vendor matching",
    scrollTarget: "smart-procurement",
    gradient: "from-blue-500/10 to-blue-600/5",
  },
  {
    icon: Shield,
    label: "Verify & Select",
    description: "Go/No-Go guardrails & compliance checks",
    scrollTarget: "deal-breakers",
    gradient: "from-emerald-500/10 to-emerald-600/5",
  },
  {
    icon: BarChart3,
    label: "Adoption Tracker",
    description: "ROI measurement & adoption scoring",
    scrollTarget: "adoption-roi",
    gradient: "from-violet-500/10 to-violet-600/5",
  },
];

const ClosedLoopHero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Parallax: content moves up slower, bg gradient shifts
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3]);

  const handlePhaseClick = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section ref={sectionRef} className="relative enterprise-gradient pt-28 pb-20 overflow-hidden" aria-label="Hero">
      {/* Parallax background layer */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ y: bgY }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/[0.04] blur-[120px]" />
      </motion.div>

      <motion.div style={{ y: contentY, opacity }} className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="max-w-6xl mx-auto">
            {/* Badge */}
            <div className="flex justify-center mb-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                Enterprise RAG Platform &middot; SOC2 Ready
              </div>
            </div>

            {/* Main content */}
            <div className="text-center mb-16">
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-[1.08] mb-6 tracking-tight animate-fade-in-up"
                style={{ animationDelay: '100ms' }}
              >
                Aviation's{" "}
                <span className="text-primary relative">
                  Digital Integrity
                  <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-primary/20 rounded-full" />
                </span>
                <br className="hidden sm:block" />
                {" "}Platform
              </h1>

              <p
                className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up"
                style={{ animationDelay: '200ms' }}
              >
                Shorten the distance between your RFP requirements and actual operational ROI
                with AI-powered procurement intelligence.
              </p>

              <div
                className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-20 animate-fade-in-up"
                style={{ animationDelay: '300ms' }}
              >
                <Button size="lg" className="min-w-[200px] h-12 text-sm font-semibold shadow-lg shadow-primary/20">
                  Request Demo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="outline" size="lg" className="min-w-[180px] h-12 text-sm font-semibold">
                  Watch Demo
                </Button>
              </div>
            </div>

            {/* Feature cards — staggered */}
            <StaggerChildren className="grid lg:grid-cols-3 gap-5" staggerDelay={0.15}>
              {phases.map((phase) => {
                const Icon = phase.icon;
                return (
                  <button
                    key={phase.label}
                    onClick={() => handlePhaseClick(phase.scrollTarget)}
                    className="enterprise-card text-left p-6 group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    aria-label={`Learn more about ${phase.label}`}
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${phase.gradient} flex items-center justify-center mb-4 transition-transform group-hover:scale-105`}>
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1.5 text-[15px]">{phase.label}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{phase.description}</p>
                  </button>
                );
              })}
            </StaggerChildren>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default ClosedLoopHero;
