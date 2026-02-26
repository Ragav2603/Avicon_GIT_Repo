import { useRef } from "react";
import { motion, useInView, type Variant } from "framer-motion";

type Direction = "up" | "down" | "left" | "right" | "none";

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  /** Distance in px for the translate offset */
  distance?: number;
}

const getInitial = (direction: Direction, distance: number): Variant => {
  const base: Record<string, number> = { opacity: 0 };
  switch (direction) {
    case "up":    base.y = distance;  break;
    case "down":  base.y = -distance; break;
    case "left":  base.x = distance;  break;
    case "right": base.x = -distance; break;
    case "none":  break;
  }
  return base;
};

const ScrollReveal = ({
  children,
  direction = "up",
  delay = 0,
  duration = 0.7,
  className = "",
  once = true,
  distance = 60,
}: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-80px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={getInitial(direction, distance)}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : getInitial(direction, distance)}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1], // cubic-bezier for that buttery feel
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
