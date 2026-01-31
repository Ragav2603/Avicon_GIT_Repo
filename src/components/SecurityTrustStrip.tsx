import { motion } from "framer-motion";
import { Shield, Lock, Globe, Server, CheckCircle } from "lucide-react";

const badges = [
  {
    icon: Shield,
    title: "SOC2 Ready",
    description: "Type II Compliant",
  },
  {
    icon: CheckCircle,
    title: "ISO 27001",
    description: "Aligned",
  },
  {
    icon: Globe,
    title: "Data Residency",
    description: "US / EU / AU",
  },
  {
    icon: Server,
    title: "Enterprise Grade",
    description: "99.9% Uptime SLA",
  },
];

const SecurityTrustStrip = () => {
  return (
    <section className="py-16 bg-foreground relative overflow-hidden">
      {/* Subtle Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 dot-pattern" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-4"
          >
            <Lock className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">Security First</span>
          </motion.div>
          
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl font-bold text-white mb-4"
          >
            Enterprise Trust & Compliance
          </motion.h3>
        </div>

        {/* Badges Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
        >
          {badges.map((badge, index) => (
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index + 0.2 }}
              className="flex flex-col items-center text-center p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-3">
                <badge.icon className="w-6 h-6 text-secondary" />
              </div>
              <h4 className="font-semibold text-white mb-1">{badge.title}</h4>
              <p className="text-sm text-white/60">{badge.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Privacy Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-xl bg-white/5 border border-white/10">
            <Shield className="w-5 h-5 text-secondary flex-shrink-0" />
            <p className="text-white/80 text-sm sm:text-base">
              <span className="font-semibold text-white">Your data is yours.</span>{" "}
              We never use your proprietary RFPs to train public models.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SecurityTrustStrip;
