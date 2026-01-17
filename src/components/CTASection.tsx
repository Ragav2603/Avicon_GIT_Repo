import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plane, CheckCircle2 } from "lucide-react";

const CTASection = () => {
  const benefits = [
    "14-day free trial",
    "No credit card required",
    "Setup in minutes",
  ];

  return (
    <section id="pricing" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero-bg" />
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-secondary/20 blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: "20%", right: "10%" }}
        />
        <motion.div
          className="absolute w-64 h-64 rounded-full bg-accent/20 blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          style={{ bottom: "20%", left: "15%" }}
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
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, type: "spring" }}
            className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center"
          >
            <Plane className="w-10 h-10 text-white" />
          </motion.div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-sky-400 bg-clip-text text-transparent">
              Aviation Operations?
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-8">
            Join leading airlines and vendors who are already saving time 
            and making smarter decisions with AeroConnect.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 text-white/80">
                <CheckCircle2 className="w-5 h-5 text-secondary" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" className="group">
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="heroOutline" size="xl">
              Schedule a Demo
            </Button>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { value: "75%", label: "Faster RFP Cycles" },
              { value: "200+", label: "Verified Vendors" },
              { value: "50+", label: "Airlines Served" },
              { value: "98%", label: "Customer Satisfaction" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-white/60 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
