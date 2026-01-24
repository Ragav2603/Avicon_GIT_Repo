import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

const HeroSection = () => {
  const features = [
    "AI-Powered RFP Matching",
    "Verified Vendor Network",
    "Real-time Analytics",
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden gradient-hero-bg">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-secondary/20 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: "10%", left: "60%" }}
        />
        <motion.div
          className="absolute w-72 h-72 rounded-full bg-accent/20 blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 80, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          style={{ bottom: "20%", left: "10%" }}
        />
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-warning" />
            <span className="text-white/90 text-sm font-medium">
              Revolutionizing Aviation Procurement
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-6"
          >
            The Airline{" "}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-cyan-300 to-sky-400 bg-clip-text text-transparent">
                Digital Integrity
              </span>
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-3 bg-secondary/30 rounded-full blur-sm"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              />
            </span>{" "}
            Platform
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-8"
          >
            AI-powered marketplace connecting airlines with verified vendors. 
            Plus intelligent adoption analytics to maximize your digital investment ROI.
          </motion.p>

          {/* Features List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 mb-10"
          >
            {features.map((feature, index) => (
              <div
                key={feature}
                className="flex items-center gap-2 text-white/80"
              >
                <CheckCircle2 className="w-5 h-5 text-secondary" />
                <span className="text-sm sm:text-base">{feature}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button variant="hero" size="xl" className="group">
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="heroOutline" size="xl">
              Watch Demo
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-16 pt-10 border-t border-white/10"
          >
            <p className="text-white/50 text-sm mb-6">Trusted by leading airlines worldwide</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {["Emirates", "Lufthansa", "Singapore Airlines", "Qatar Airways", "Etihad"].map((airline) => (
                <span key={airline} className="text-white/80 font-semibold text-lg">
                  {airline}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Floating Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 lg:mt-24 relative"
        >
          <div className="max-w-5xl mx-auto">
            <div className="glass-card-dark rounded-2xl p-6 lg:p-8 border border-white/10">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 p-6 rounded-xl bg-gradient-to-br from-secondary/20 to-accent/20 border border-white/10">
                  <h3 className="text-white font-semibold text-lg mb-2">RFP Marketplace</h3>
                  <p className="text-white/60 text-sm">Post RFPs and get matched with verified vendors in hours, not months.</p>
                </div>
                <div className="flex-1 p-6 rounded-xl bg-gradient-to-br from-warning/20 to-orange-500/20 border border-white/10">
                  <h3 className="text-white font-semibold text-lg mb-2">Adoption Ops</h3>
                  <p className="text-white/60 text-sm">Audit your digital tools and get actionable ROI recommendations.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(222, 47%, 98%)"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
