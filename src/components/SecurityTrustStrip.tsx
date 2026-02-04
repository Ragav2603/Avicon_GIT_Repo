import { motion } from "framer-motion";
import { Shield, CheckCircle, Globe, Lock } from "lucide-react";

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
];

const SecurityTrustStrip = () => {
  return (
    <section className="py-12 bg-foreground relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center lg:justify-start gap-6"
          >
            {badges.map((badge, index) => (
              <motion.div
                key={badge.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 cursor-pointer transition-all duration-200 hover:bg-primary-foreground/10"
              >
                <badge.icon className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-semibold text-primary-foreground text-sm">{badge.title}</p>
                  <p className="text-xs text-primary-foreground/60">{badge.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Privacy Message */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 px-5 py-3 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10"
          >
            <Lock className="w-5 h-5 text-accent shrink-0" />
            <p className="text-primary-foreground/80 text-sm">
              <span className="font-semibold text-primary-foreground">Your data is yours.</span>{" "}
              Never used to train public models.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SecurityTrustStrip;
