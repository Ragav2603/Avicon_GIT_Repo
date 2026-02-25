import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StageSectionProps {
    title: string;
    description: string;
    align: 'left' | 'right';
    icon: LucideIcon;
    number: string;
}

export const StageSection: React.FC<StageSectionProps> = ({ title, description, align, icon: Icon, number }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, amount: 0.5 });

    const isLeft = align === 'left';

    // Using slideUp and fadeIn equivalents from the dark-ts guide combined with framer motion
    return (
        <div className={`w-full flex ${isLeft ? 'justify-start' : 'justify-end'} relative py-32 sm:py-48`}>
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 30, filter: 'blur(10px)' }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="w-full md:w-5/12 backdrop-blur-lg bg-black/40 border border-white/10 p-8 rounded-2xl relative overflow-hidden group shadow-glow"
            >
                {/* Subtle hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-aviation-pink/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-sm bg-white/5 border border-white/10 text-aviation-cyan group-hover:text-aviation-orange group-hover:border-aviation-orange/50 transition-colors duration-300">
                            <Icon size={24} />
                        </div>
                        <span className="text-white/60 font-mono text-xl tracking-widest">{number}</span>
                    </div>

                    <h3 className="text-3xl md:text-4xl font-semibold text-white mb-4 tracking-tight drop-shadow-md group-hover:text-aviation-cyan transition-colors duration-300">
                        {title}
                    </h3>

                    <p className="text-slate-300 text-lg leading-relaxed mix-blend-lighten">
                        {description}
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default StageSection;
