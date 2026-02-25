import React, { useRef } from 'react';
import DatastreamCanvas from './DatastreamCanvas';
import StageSection from './StageSection';
import { FileText, ShieldCheck, Play, TrendingUp } from 'lucide-react';

export const ScrollExperience = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <section ref={containerRef} className="relative w-full bg-aviation-blue text-white overflow-hidden py-24 min-h-screen">
            {/* The Datastream Canvas background */}
            <DatastreamCanvas />

            {/* Content Container - Needs z-index to be above the absolute canvas */}
            <div className="container relative z-10 mx-auto px-4 lg:px-8">
                {/* Intro to the section */}
                <div className="text-center mb-32 max-w-3xl mx-auto pt-24 drop-shadow-lg">
                    <h2 className="text-4xl md:text-5xl md:leading-[1.2] font-bold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-aviation-cyan via-aviation-pink to-aviation-orange pb-2">
                        Real-Time Intelligence
                    </h2>
                    <p className="text-xl text-slate-200">
                        A seamless flight plan from raw requirements to measurable ROI.
                    </p>
                </div>

                {/* The 4 Stages */}
                <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center">
                    <StageSection
                        number="01"
                        title="AI Drafting"
                        description="Transform unstructured ideas into precise procurement requirements. Our AI engines analyze your historical data and industry standards to draft comprehensive RFPs in seconds, not weeks."
                        icon={FileText}
                        align="left"
                    />

                    <StageSection
                        number="02"
                        title="Guardrails"
                        description="Ensure compliance and mitigate risk before you publish. Built-in, customizable guardrails automatically review requirements against your company policies and regulatory frameworks."
                        icon={ShieldCheck}
                        align="right"
                    />

                    <StageSection
                        number="03"
                        title="Integration"
                        description="Connect seamlessly with your existing tech stack. Whether it's ERP, CRM, or specialized procurement tools, Avicon integrates smoothly to keep your data flowing and aligned."
                        icon={Play}
                        align="left"
                    />

                    <StageSection
                        number="04"
                        title="Adoption & ROI"
                        description="Measure what matters. Track engagement, supplier responses, and internal adoption rates. Turn qualitative processes into quantitative intelligence that drives decisive negotiations."
                        icon={TrendingUp}
                        align="right"
                    />
                </div>

                {/* Spacer at the bottom to ensure the scroll finishes nicely */}
                <div className="h-64 w-full"></div>
            </div>
        </section>
    );
};

export default ScrollExperience;
