import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, FileText, Sparkles, Users, Target, Zap } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background">
      
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
        <div className="max-w-6xl mx-auto">
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
                AI-Assisted Procurement Ecosystem
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-[1.1] mb-8 tracking-tight"
            >
              From Old Docs to{" "}
              <br className="hidden sm:block" />
              <span className="text-primary">New Deals in Minutes.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
            >
              Upload your previous RFPs or Proposals. Let our AI draft your next move.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <Button variant="default" size="lg" className="group min-w-[220px]">
                Request Access
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="min-w-[200px]">
                Watch Demo
              </Button>
            </motion.div>
          </div>

          {/* Split-Screen Upload Flow Animation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative max-w-5xl mx-auto"
          >
            <div className="grid lg:grid-cols-3 gap-6 items-center">
              {/* Left - Airline Flow */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-card rounded-2xl border border-border p-6 shadow-lg relative"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-secondary" />
                  </div>
                  <span className="font-semibold text-foreground">Airlines</span>
                </div>
                
                {/* Flow Steps */}
                <div className="space-y-4">
                  <motion.div 
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                  >
                    <Upload className="w-5 h-5 text-secondary" />
                    <span className="text-sm text-foreground">Upload Old RFP</span>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  >
                    <Sparkles className="w-5 h-5 text-secondary" />
                    <span className="text-sm text-foreground">AI Extracts Segments</span>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/10 border border-secondary/20"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  >
                    <FileText className="w-5 h-5 text-secondary" />
                    <span className="text-sm font-medium text-secondary">Generates New RFP</span>
                  </motion.div>
                </div>
              </motion.div>

              {/* Center - Match Score */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="flex flex-col items-center justify-center py-8"
              >
                {/* Connection Lines */}
                <div className="hidden lg:flex items-center w-full">
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-secondary/20 to-secondary/50" />
                  <motion.div 
                    className="relative mx-4"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center shadow-lg shadow-secondary/30">
                      <div className="text-center">
                        <Target className="w-6 h-6 text-white mx-auto mb-1" />
                        <span className="text-white text-xs font-medium">Match</span>
                      </div>
                    </div>
                    {/* Animated Ring */}
                    <motion.div 
                      className="absolute inset-0 rounded-full border-2 border-secondary/30"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-secondary/50 to-warning/50" />
                </div>
                
                {/* Mobile Match Indicator */}
                <div className="lg:hidden">
                  <motion.div 
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center shadow-lg shadow-secondary/30"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="text-center">
                      <Target className="w-5 h-5 text-white mx-auto mb-1" />
                      <span className="text-white text-xs font-medium">Match</span>
                    </div>
                  </motion.div>
                </div>
                
                <motion.div 
                  className="mt-4 px-4 py-2 rounded-full bg-gradient-to-r from-secondary/10 to-warning/10 border border-secondary/20"
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-sm font-semibold text-primary">98% Match Score</span>
                </motion.div>
              </motion.div>

              {/* Right - Vendor Flow */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-card rounded-2xl border border-border p-6 shadow-lg relative"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-warning" />
                  </div>
                  <span className="font-semibold text-foreground">Vendors</span>
                </div>
                
                {/* Flow Steps */}
                <div className="space-y-4">
                  <motion.div 
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                  >
                    <Upload className="w-5 h-5 text-warning" />
                    <span className="text-sm text-foreground">Upload Old Proposals</span>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  >
                    <Sparkles className="w-5 h-5 text-warning" />
                    <span className="text-sm text-foreground">AI Matches Segments</span>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  >
                    <FileText className="w-5 h-5 text-warning" />
                    <span className="text-sm font-medium text-warning">Draft Response Ready</span>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
