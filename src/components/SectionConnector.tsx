import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

const SectionConnector = () => {
  return (
    <div id="how-it-works" className="relative py-12 bg-background flex flex-col items-center justify-center gap-3 scroll-mt-20">
      {/* Gradient line */}
      <div className="section-divider w-48" />

      {/* Animated arrow icon */}
      <motion.div
        className="w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center shadow-sm"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ArrowDown className="w-4 h-4 text-secondary" />
      </motion.div>

      {/* Gradient line */}
      <div className="section-divider w-48" />
    </div>
  );
};

export default SectionConnector;
