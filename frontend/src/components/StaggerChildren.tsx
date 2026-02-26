import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface StaggerChildrenProps {
  children: React.ReactNode;
  className?: string;
  /** Delay between each child in seconds */
  staggerDelay?: number;
  /** Animation duration per child */
  duration?: number;
  /** Only animate once */
  once?: boolean;
}

const containerVariants = (staggerDelay: number) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: staggerDelay,
    },
  },
});

const childVariants = (duration: number) => ({
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
});

/**
 * Wrap direct children in staggered fade-up animations.
 * Each direct child gets its own delay offset.
 *
 * Usage:
 * <StaggerChildren>
 *   <div>Card 1</div>
 *   <div>Card 2</div>
 *   <div>Card 3</div>
 * </StaggerChildren>
 */
const StaggerChildren = ({
  children,
  className = "",
  staggerDelay = 0.12,
  duration = 0.6,
  once = true,
}: StaggerChildrenProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-60px 0px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants(staggerDelay)}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div key={i} variants={childVariants(duration)}>
              {child}
            </motion.div>
          ))
        : <motion.div variants={childVariants(duration)}>{children}</motion.div>
      }
    </motion.div>
  );
};

export default StaggerChildren;
