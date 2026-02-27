import React, { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

interface FlightPathAnimationProps {
    containerRef: React.RefObject<HTMLDivElement>;
}

export const FlightPathAnimation: React.FC<FlightPathAnimationProps> = ({ containerRef }) => {
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const pathLength = useSpring(scrollYProgress, {
        stiffness: 50,
        damping: 20,
        restDelta: 0.001
    });

    return (
        <div className="absolute inset-0 pointer-events-none z-0 flex justify-center overflow-hidden">
            <svg
                viewBox="0 0 100 1000"
                preserveAspectRatio="none"
                className="w-full max-w-[1000px] h-full"
            >
                <defs>
                    <linearGradient id="neonGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ff6340" /> {/* aviation-orange */}
                        <stop offset="50%" stopColor="#a65db4" /> {/* aviation-pink */}
                        <stop offset="100%" stopColor="#89aeff" /> {/* aviation-cyan */}
                    </linearGradient>

                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Background faint path - giving a track to follow */}
                <path
                    d="M 50 0 C 80 150, 20 250, 50 400 C 80 550, 20 650, 50 800 C 80 900, 50 950, 50 1000"
                    fill="none"
                    stroke="rgba(137, 174, 255, 0.1)"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                />

                {/* Animated glowing path */}
                <motion.path
                    d="M 50 0 C 80 150, 20 250, 50 400 C 80 550, 20 650, 50 800 C 80 900, 50 950, 50 1000"
                    fill="none"
                    stroke="url(#neonGradient)"
                    strokeWidth="3"
                    vectorEffect="non-scaling-stroke"
                    style={{ pathLength }}
                    filter="url(#glow)"
                />
            </svg>
        </div>
    );
};

export default FlightPathAnimation;
