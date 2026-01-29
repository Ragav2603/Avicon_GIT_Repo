import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

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

const HeroSection = () => {
  const stats = [
    { value: "70%", label: "Faster Evaluations" },
    { value: "3x", label: "Better ROI" },
    { value: "Zero", label: "Shelfware" },
  ];

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
          <div className="text-center mb-16">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-secondary text-sm font-medium">
                The Aviation Digital Integrity Platform
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-[1.1] mb-8 tracking-tight"
            >
              Fast, trusted answers{" "}
              <br className="hidden sm:block" />
              that{" "}
              <span className="gradient-text">win deals</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Connect with verified vendors through AI-powered RFP matching.
              Track adoption metrics to maximize your digital investment ROI.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button variant="hero" size="xl" className="group min-w-[200px]">
                Request Demo
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="hero" size="xl" className="min-w-[200px]">
                <Play className="w-5 h-5" />
                Watch Video
              </Button>
            </motion.div>
          </div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mb-20"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold stat-number mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-sm sm:text-base">
                  {stat.label}
                </div>
              </motion.div>
            ))}
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
