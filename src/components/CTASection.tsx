import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden bg-secondary">
      {/* Dot pattern */}
      <div className="absolute inset-0 dot-pattern opacity-10" />
      
      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
            top: "10%",
            right: "-10%",
          }}
        />
        <div 
          className="absolute w-[400px] h-[400px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
            bottom: "10%",
            left: "-5%",
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
            Ready to Transform{" "}
            <span className="text-white/90">
              Your Procurement?
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Join leading airlines who are already saving weeks on every RFP 
            with AI-assisted procurement and verified vendor matching.
          </p>

          {/* CTA Button */}
          <Button 
            variant="outline" 
            size="xl" 
            className="group bg-white text-secondary hover:bg-white/90 border-white"
          >
            Request Access
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8 pt-12 border-t border-white/20"
          >
            {[
              { value: "70%", label: "Faster Evaluation Time" },
              { value: "3x", label: "Better ROI Tracking" },
              { value: "Zero", label: "Shelfware Purchases" },
              { value: "100%", label: "Adoption Visibility" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-white/70 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
