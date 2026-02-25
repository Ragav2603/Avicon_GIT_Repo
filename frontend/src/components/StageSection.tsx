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
    const isInView = useInView(ref, { once: false, amount: 0.5 }); // Trigger when 50% visible

    const isLeft = align === 'left';

    return (
        <div className={`w-full flex ${isLeft ? 'justify-start' : 'justify-end'} relative py-32 sm:py-48`}>
            <motion.div
                ref={ref}
                initial={{ opacity: 0, x: isLeft ? -50 : 50, filter: 'blur(10px)' }}
                animate={isInView ? { opacity: 1, x: 0, filter: 'blur(0px)' } : { opacity: 0, x: isLeft ? -50 : 50, filter: 'blur(10px)' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full md:w-5/12 bg-aviation-blue/50 backdrop-blur-md border border-aviation-cyan/20 p-8 rounded-2xl relative overflow-hidden group"
            >
                {/* Subtle hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-aviation-pink/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-aviation-blue border border-aviation-orange/50 text-aviation-orange shadow-[0_0_15px_rgba(255,99,64,0.3)]">
                            <Icon size={24} />
                        </div>
                        <span className="text-aviation-cyan font-mono text-xl tracking-widest">{number}</span>
                    </div>

                    <h3 className="text-3xl md:text-4xl font-semibold text-white mb-4 tracking-tight drop-shadow-md">
                        {title}
                    </h3>

                    <p className="text-slate-300 text-lg leading-relaxed">
                        {description}
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default StageSection;
