import { motion } from "framer-motion";

const SectionConnector = () => {
  return (
    <div className="relative h-24 overflow-hidden bg-gradient-to-b from-background to-muted/30">
      {/* Animated connecting line */}
      <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 flex flex-col items-center">
        {/* Dashed vertical line */}
        <motion.div
          className="w-px h-full relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {/* Static dashed line */}
          <div className="absolute inset-0 border-l-2 border-dashed border-secondary/30" />
          
          {/* Animated pulse traveling down */}
          <motion.div
            className="absolute left-0 w-2 h-8 -translate-x-1/2 rounded-full"
            style={{
              background: "linear-gradient(180deg, transparent, hsl(var(--secondary) / 0.6), transparent)",
            }}
            animate={{
              top: ["-10%", "110%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 1,
            }}
          />
        </motion.div>
      </div>

      {/* Decorative dots at top and bottom */}
      <motion.div
        className="absolute left-1/2 top-0 -translate-x-1/2 w-3 h-3 rounded-full bg-secondary/40"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute left-1/2 bottom-0 -translate-x-1/2 w-3 h-3 rounded-full bg-secondary/40"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Side decorative elements */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4">
        <motion.div
          className="w-8 h-px bg-gradient-to-r from-transparent to-secondary/30"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ transformOrigin: "right" }}
        />
        <motion.div
          className="w-2 h-2 rounded-full bg-secondary/50"
          animate={{
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="w-8 h-px bg-gradient-to-l from-transparent to-secondary/30"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ transformOrigin: "left" }}
        />
      </div>
    </div>
  );
};

export default SectionConnector;
